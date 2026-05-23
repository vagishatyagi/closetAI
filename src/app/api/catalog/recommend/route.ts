import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateStyleEmbedding } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// Cosine similarity helper for JS fallback if profile vector isn't active
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// exqusite collection of mock products from favorite stores
const SHOP_CATALOG = [
  {
    id: 'prod_1',
    name: 'Classic Linen Blazer',
    storeName: 'Everlane',
    price: 88.00,
    category: 'Outerwear',
    description: 'A structured summer blazer made of breathable organic linen in a clean sandy beige color.',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=500&q=80',
    tags: 'Beige Linen Blazer Smart Casual Minimalist'
  },
  {
    id: 'prod_2',
    name: 'Slim-Fit Indigo Denim',
    storeName: 'Levi\'s',
    price: 79.50,
    category: 'Bottom',
    description: 'Deep indigo raw heavy denim jeans with classic tobacco stitching and a tapered silhouette.',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80',
    tags: 'Blue Denim Jeans Casual Minimalist Rugged'
  },
  {
    id: 'prod_3',
    name: 'Cashmere Crewneck Sweater',
    storeName: 'Uniqlo',
    price: 99.90,
    category: 'Top',
    description: 'Luxuriously soft charcoal gray crewneck knit sweater made from 100% fine-gauge cashmere.',
    imageUrl: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=500&q=80',
    tags: 'Charcoal Gray Cashmere Sweater Smart Casual Cozy'
  },
  {
    id: 'prod_4',
    name: 'Leather Chelsea Boots',
    storeName: 'ZARA',
    price: 119.00,
    category: 'Footwear',
    description: 'Handcrafted rich mahogany brown leather chelsea boots with elastic side panels and durable lug soles.',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=500&q=80',
    tags: 'Brown Leather Chelsea Boots Formal Smart Casual preppy'
  },
  {
    id: 'prod_5',
    name: 'Water-Resistant Rain Parka',
    storeName: 'Patagonia',
    price: 149.00,
    category: 'Outerwear',
    description: 'Forest green rain parka with fully taped seams, adjustable hood, and high precipitation resistance.',
    imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=500&q=80',
    tags: 'Green Rain Parka Outerwear Athletic Outdoor'
  },
  {
    id: 'prod_6',
    name: 'Premium Cotton Oxford Shirt',
    storeName: 'Ralph Lauren',
    price: 65.00,
    category: 'Top',
    description: 'Light blue crisp cotton oxford button-down shirt featuring a structured collar and signature embroidery.',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
    tags: 'Light Blue Cotton Oxford Shirt Formal Preppy'
  }
];

/**
 * GET /api/catalog/recommend
 * Matches items from custom stores against the user's running style preferences vector,
 * filtering strictly under a specified budget.
 */
export async function GET(req: NextRequest) {
  const functionName = 'GET /api/catalog/recommend';
  logger.info(functionName, { headers: Object.fromEntries(req.headers) });

  try {
    const { searchParams } = new URL(req.url);
    const customUserId = searchParams.get('userId');
    const maxBudgetParam = searchParams.get('budget');

    const userId = customUserId || '00000000-0000-0000-0000-000000000000';

    // 1. Fetch user budget limit and style preference vector
    let maxBudget = maxBudgetParam ? parseFloat(maxBudgetParam) : 100.00;
    let preferenceVector: number[] | null = null;

    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('budget_cap_usd, style_preference_vector')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      if (!maxBudgetParam && profile.budget_cap_usd) {
        maxBudget = Number(profile.budget_cap_usd);
      }
      if (profile.style_preference_vector && Array.isArray(profile.style_preference_vector)) {
        preferenceVector = profile.style_preference_vector as number[];
      }
    } else if (dbError) {
      logger.warn('Could not read user profile. Continuing with default budget.', dbError);
    }

    // 2. Filter products that are strictly under the budget limit
    const budgetFilteredCatalog = SHOP_CATALOG.filter(prod => prod.price <= maxBudget);

    if (budgetFilteredCatalog.length === 0) {
      logger.info(functionName, { success: true, count: 0, message: 'No items in catalog match the budget criteria.' });
      return NextResponse.json({
        success: true,
        recommendations: [],
        message: 'No store items are available under your current budget. Try expanding your budget!'
      });
    }

    // 3. Compute vector matches
    let recommendations = [];

    if (preferenceVector && preferenceVector.length === 1536) {
      // Real Vector Similarity Match!
      logger.info(functionName, { status: 'Calculating live vector similarity over catalog using text-embedding-004' });
      
      const scoredCatalog = await Promise.all(
        budgetFilteredCatalog.map(async (product) => {
          try {
            // Generate standard product description matching style preferences
            const searchDescription = `${product.name} ${product.category} in ${product.description} Tags: ${product.tags}`;
            const itemEmbedding = await generateStyleEmbedding(searchDescription);
            const similarity = cosineSimilarity(preferenceVector!, itemEmbedding);
            
            return {
              ...product,
              similarityScore: Math.round(similarity * 100) / 100 // round to 2 decimals
            };
          } catch (embedError) {
            logger.error(`Failed to generate embedding for catalog item ${product.id}`, embedError);
            return {
              ...product,
              similarityScore: 0.5 // average default
            };
          }
        })
      );

      // Sort by similarity score descending
      recommendations = scoredCatalog.sort((a, b) => b.similarityScore - a.similarityScore);
    } else {
      // Fallback Match: Semantic keyword intersection simulator if user has no preferences yet
      logger.info(functionName, { status: 'No preference vector found. Sorting by catalog price & popularity.' });
      
      recommendations = budgetFilteredCatalog.map((product, idx) => ({
        ...product,
        // Mock a reasonable distribution of scores for the hackathon UI
        similarityScore: Math.round((0.85 - (idx * 0.05)) * 100) / 100
      }));
    }

    logger.info(functionName, { success: true, recommendedCount: recommendations.length });

    return NextResponse.json({
      success: true,
      userBudgetLimit: maxBudget,
      hasPreferenceVector: !!preferenceVector,
      recommendations
    });

  } catch (error: any) {
    logger.error('Internal server error in catalog recommender', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
