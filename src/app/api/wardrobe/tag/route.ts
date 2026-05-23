import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateWardrobeTags, generateStyleEmbedding } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { resolveAppUser } from '@/lib/profile';

export const runtime = 'nodejs';

/**
 * POST /api/wardrobe/tag
 * Processes an uploaded image to extract fashion tags, generate vector embeddings,
 * and save the entire record to the public.wardrobe_items database.
 */
export async function POST(req: NextRequest) {
  const functionName = 'POST /api/wardrobe/tag';
  logger.info(functionName, { headers: Object.fromEntries(req.headers) });

  try {
    const body = await req.json();
    const { imageUrl, userId: customUserId, userProfile } = body;

    if (!imageUrl) {
      logger.warn('Tagging attempted without imageUrl.');
      return NextResponse.json(
        { error: 'Bad Request: Missing "imageUrl" parameter in JSON body.' },
        { status: 400 }
      );
    }

    logger.info(functionName, { imageUrl, customUserId, email: userProfile?.email });

    // 1. Fetch the image from Supabase Storage / Public link and parse to Base64
    let base64Image = '';
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('data:')) {
      try {
        const matches = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Image = matches[2];
        } else {
          throw new Error('Invalid Base64 Data URL format');
        }
      } catch (parseError: any) {
        logger.error('Failed to parse inline Base64 data URL', parseError);
        return NextResponse.json(
          { error: `Data URL Parse Error: ${parseError.message}` },
          { status: 422 }
        );
      }
    } else {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType) {
          mimeType = contentType;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString('base64');
      } catch (fetchError: any) {
        logger.error('Failed to retrieve image for tagging', fetchError);
        return NextResponse.json(
          { error: `Fetch Error: Could not download the uploaded image from GCS. ${fetchError.message}` },
          { status: 422 }
        );
      }
    }

    // 2. Call Gemini 1.5 Flash to automatically extract catalog tags
    const tags = await generateWardrobeTags(base64Image, mimeType);
    logger.info(functionName, { autoTagsExtracted: tags });

    // 3. Compose a descriptive styling text representing the garment
    // This text is processed by text-embedding-004 to create the style preference vector.
    const styleDescription = `A ${tags.colorFamily} ${tags.fabric} ${tags.subCategory} featuring a ${tags.pattern} pattern. Designed in a ${tags.formality} ${tags.primaryAesthetic} aesthetic. Comfortable between ${tags.weatherSuitability.minTempF}°F and ${tags.weatherSuitability.maxTempF}°F. Rain resistant: ${tags.weatherSuitability.precipitationResistant ? 'Yes' : 'No'}.`;

    // 4. Call Gemini Embedding API to produce style vectors (1536 dims)
    const styleEmbedding = await generateStyleEmbedding(styleDescription);

    // 5. Database user resolution. The service role route creates/updates the
    // profile first so wardrobe_items passes the auth.users foreign key.
    const { userId } = await resolveAppUser({
      userId: customUserId,
      fullName: userProfile?.fullName,
      email: userProfile?.email,
      locationCity: userProfile?.locationCity,
      budgetLimit: userProfile?.budgetLimit,
    });
    const admin = getSupabaseAdmin();

    // 6. Insert full wardrobe record into PostgreSQL
    const { data: wardrobeItem, error: dbError } = await admin
      .from('wardrobe_items')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        category: tags.category,
        sub_category: tags.subCategory,
        color_family: tags.colorFamily,
        pattern: tags.pattern,
        fabric: tags.fabric,
        formality: tags.formality,
        min_temp: tags.weatherSuitability.minTempF,
        max_temp: tags.weatherSuitability.maxTempF,
        precipitation_resistant: tags.weatherSuitability.precipitationResistant,
        style_embedding: styleEmbedding, // pgvector (1536) array representation
      })
      .select()
      .single();

    if (dbError) {
      logger.error('Failed to save wardrobe item to PostgreSQL database', dbError);

      const fallbackItem = {
        id: crypto.randomUUID(),
        user_id: userId,
        image_url: imageUrl,
        category: tags.category,
        sub_category: tags.subCategory,
        color_family: tags.colorFamily,
        pattern: tags.pattern,
        fabric: tags.fabric,
        formality: tags.formality,
        min_temp: tags.weatherSuitability.minTempF,
        max_temp: tags.weatherSuitability.maxTempF,
        precipitation_resistant: tags.weatherSuitability.precipitationResistant,
        created_at: new Date().toISOString(),
        persisted: false,
      };

      return NextResponse.json({
        success: true,
        persisted: false,
        warning: `Database save skipped: ${dbError.message}`,
        userId,
        item: fallbackItem,
        tags,
      });
    }

    logger.info(functionName, { success: true, item: wardrobeItem });

    return NextResponse.json({
      success: true,
      userId,
      item: wardrobeItem,
      tags,
    });
  } catch (error: any) {
    logger.error('Internal server error in tagging route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
