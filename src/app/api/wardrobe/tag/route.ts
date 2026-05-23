import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWardrobeTags, generateStyleEmbedding } from '@/lib/gemini';
import { logger } from '@/lib/logger';

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
    const { imageUrl, userId: customUserId } = body;

    if (!imageUrl) {
      logger.warn('Tagging attempted without imageUrl.');
      return NextResponse.json(
        { error: 'Bad Request: Missing "imageUrl" parameter in JSON body.' },
        { status: 400 }
      );
    }

    logger.info(functionName, { imageUrl, customUserId });

    // 1. Fetch the image from Supabase Storage / Public link and parse to Base64
    let base64Image = '';
    let mimeType = 'image/jpeg';

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

    // 2. Call Gemini 1.5 Flash to automatically extract catalog tags
    const tags = await generateWardrobeTags(base64Image, mimeType);
    logger.info(functionName, { autoTagsExtracted: tags });

    // 3. Compose a descriptive styling text representing the garment
    // This text is processed by text-embedding-004 to create the style preference vector.
    const styleDescription = `A ${tags.colorFamily} ${tags.fabric} ${tags.subCategory} featuring a ${tags.pattern} pattern. Designed in a ${tags.formality} ${tags.primaryAesthetic} aesthetic. Comfortable between ${tags.weatherSuitability.minTempF}°F and ${tags.weatherSuitability.maxTempF}°F. Rain resistant: ${tags.weatherSuitability.precipitationResistant ? 'Yes' : 'No'}.`;

    // 4. Call Gemini Embedding API to produce style vectors (1536 dims)
    const styleEmbedding = await generateStyleEmbedding(styleDescription);

    // 5. Database user resolution (uses mock fallback for easy local hackathon tests)
    const userId = customUserId || '00000000-0000-0000-0000-000000000000';

    // 6. Insert full wardrobe record into PostgreSQL
    const { data: wardrobeItem, error: dbError } = await supabase
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
      
      // If table profiles doesn't contain the mock user, we need to create it or bypass profile constraints
      if (dbError.message.includes('foreign key constraint')) {
        logger.warn('Foreign key profile mismatch. Proactively provisioning mock profile row.');
        
        // Upsert mock profile first to ensure foreign key constraint passes
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: 'Hackathon User',
            location_city: 'New York',
            temperature_unit: 'F',
          });

        // Retry the wardrobe_items insert
        const { data: retryItem, error: retryError } = await supabase
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
            style_embedding: styleEmbedding,
          })
          .select()
          .single();

        if (retryError) {
          return NextResponse.json(
            { error: `Database insert failed on retry: ${retryError.message}` },
            { status: 500 }
          );
        }

        logger.info(functionName, { success: true, item: retryItem });
        return NextResponse.json({
          success: true,
          item: retryItem,
          tags,
        });
      }

      return NextResponse.json(
        { error: `Database Save Error: ${dbError.message}` },
        { status: 500 }
      );
    }

    logger.info(functionName, { success: true, item: wardrobeItem });

    return NextResponse.json({
      success: true,
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
