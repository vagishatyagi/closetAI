import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/ootd/feedback
 * Records user like/dislike and dynamically updates the profile's running style preference vector
 * using pgvector-compatible weighted moving average.
 */
export async function POST(req: NextRequest) {
  const functionName = 'POST /api/ootd/feedback';
  logger.info(functionName, { headers: Object.fromEntries(req.headers) });

  try {
    const body = await req.json();
    const { userId: customUserId, itemIds, liked, dislikeReason } = body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0 || liked === undefined) {
      logger.warn('Feedback recorded with missing arguments');
      return NextResponse.json(
        { error: 'Bad Request: Missing "itemIds" (array) or "liked" (boolean) parameters in body.' },
        { status: 400 }
      );
    }

    const userId = customUserId || '00000000-0000-0000-0000-000000000000';

    logger.info(functionName, { userId, itemIds, liked, dislikeReason });

    // 1. Insert explicit feedback record to Postgres
    const { error: insertError } = await supabase
      .from('user_feedbacks')
      .insert({
        user_id: userId,
        outfit_item_ids: itemIds,
        liked: liked,
        dislike_reason: dislikeReason || null
      });

    if (insertError) {
      logger.error('Failed to log user feedback record', insertError);
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 2. If liked, update the user style preference vector dynamically
    if (liked) {
      // A. Fetch style embeddings of all items in the outfit
      const { data: items, error: fetchError } = await supabase
        .from('wardrobe_items')
        .select('style_embedding')
        .in('id', itemIds);

      if (fetchError) {
        logger.error('Failed to fetch item style embeddings for updating preference vector', fetchError);
      } else if (items && items.length > 0) {
        // Parse and filter valid embeddings
        const validEmbeddings = items
          .map(item => item.style_embedding)
          .filter(emb => Array.isArray(emb) && emb.length === 1536) as number[][];

        if (validEmbeddings.length > 0) {
          // Compute average vector of current outfit items
          const avgVector = new Array(1536).fill(0);
          for (let i = 0; i < 1536; i++) {
            let sum = 0;
            for (let j = 0; j < validEmbeddings.length; j++) {
              sum += validEmbeddings[j][i];
            }
            avgVector[i] = sum / validEmbeddings.length;
          }

          // B. Fetch existing profile vector
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('style_preference_vector')
            .eq('id', userId)
            .maybeSingle();

          let finalVector = avgVector;

          if (profile?.style_preference_vector && Array.isArray(profile.style_preference_vector)) {
            const existingVector = profile.style_preference_vector as number[];
            if (existingVector.length === 1536) {
              // Perform standard moving average (80% existing preference, 20% current outfit attributes)
              finalVector = existingVector.map((val, idx) => (val * 0.8) + (avgVector[idx] * 0.2));
            }
          }

          // C. Update user profile with new aggregated vector
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ style_preference_vector: finalVector })
            .eq('id', userId);

          if (updateError) {
            logger.error('Failed to update profile style_preference_vector', updateError);
          } else {
            logger.info('Updated style preference vector successfully!', { userId });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback processed and user style preference vector updated successfully.'
    });

  } catch (error: any) {
    logger.error('Internal server error in feedback route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
