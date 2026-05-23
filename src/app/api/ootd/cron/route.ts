import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateOOTD } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { fetchWeather } from '@/lib/weather';
import { sendStyleDigestEmail } from '@/lib/email';
import type { CalendarEventPayload, WardrobeItemRecord } from '@/lib/ootdUtils';

export const runtime = 'nodejs';

/**
 * POST /api/ootd/cron
 * Vercel Scheduler endpoint for daily styling digests.
 */
export async function POST(req: NextRequest) {
  const functionName = 'POST /api/ootd/cron';
  logger.info(functionName, { hasAuthorization: Boolean(req.headers.get('authorization')) });

  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized attempt to trigger cron scheduler.');
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid cron scheduler credentials.' },
        { status: 401 }
      );
    }

    const admin = getSupabaseAdmin();
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('id, full_name, email, location_city, temperature_unit');

    if (profilesError) {
      logger.warn('Failed to retrieve user profiles for cron dispatch.', profilesError);
      return NextResponse.json({
        success: true,
        totalProcessed: 0,
        warning: `Profiles table is not available: ${profilesError.message}`,
        dispatchResults: [],
      });
    }

    const dispatchResults = [];

    for (const profile of profiles || []) {
      try {
        if (!profile.email) {
          dispatchResults.push({
            userId: profile.id,
            fullName: profile.full_name,
            emailStatus: 'Skipped: profile has no email address',
          });
          continue;
        }

        const weather = await fetchWeather(profile.location_city || 'New York');
        const calendar: CalendarEventPayload[] = [
          {
            time: 'Today',
            title: 'Daily outfit digest',
            description: 'Scheduled digest jobs use weather, closet items, and feedback. Open the app to connect Google Calendar for live event-aware planning.',
            source: 'cron',
          },
        ];

        const { data: closet } = await admin
          .from('wardrobe_items')
          .select('id, category, sub_category, color_family, pattern, fabric, formality, min_temp, max_temp, precipitation_resistant, image_url')
          .eq('user_id', profile.id);

        const { data: feedbacks } = await admin
          .from('user_feedbacks')
          .select('outfit_item_ids, liked, dislike_reason')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20);

        const closetItems = (closet && closet.length > 0 ? closet : buildCronFallbackCloset()) as WardrobeItemRecord[];
        const ootdResult = await generateOOTD(weather, calendar, closetItems, feedbacks || []);
        const primaryOutfit = ootdResult.outfits?.[0];

        if (!primaryOutfit) {
          dispatchResults.push({
            userId: profile.id,
            fullName: profile.full_name,
            emailStatus: 'Skipped: planner returned no outfit',
          });
          continue;
        }

        const emailResult = await sendStyleDigestEmail({
          to: profile.email,
          fullName: profile.full_name,
          city: profile.location_city || weather.city,
          weather,
          calendar,
          outfit: primaryOutfit,
        });

        dispatchResults.push({
          userId: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          emailStatus: emailResult.success ? 'Sent Successfully' : emailResult.message || emailResult.error || 'Failed',
          plannerSource: ootdResult.plannerSource,
        });
      } catch (profileError: any) {
        logger.error(`Error processing cron styling digest for profile ${profile.id}`, profileError);
        dispatchResults.push({
          userId: profile.id,
          fullName: profile.full_name,
          emailStatus: `Error: ${profileError.message}`,
        });
      }
    }

    logger.info(functionName, { success: true, totalProcessed: dispatchResults.length });

    return NextResponse.json({
      success: true,
      totalProcessed: dispatchResults.length,
      dispatchResults,
    });
  } catch (error: any) {
    logger.error('Internal server error in cron dispatch route', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}

function buildCronFallbackCloset(): WardrobeItemRecord[] {
  return [
    {
      id: '11111111-1111-1111-1111-111111111111',
      category: 'Top',
      sub_category: 'Oxford Shirt',
      color_family: 'Light Blue',
      pattern: 'Solid',
      fabric: 'Cotton Oxford',
      formality: 'Smart Casual',
      min_temp: 55,
      max_temp: 80,
      precipitation_resistant: false,
      image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      category: 'Bottom',
      sub_category: 'Chinos',
      color_family: 'Navy Blue',
      pattern: 'Solid',
      fabric: 'Cotton Twill',
      formality: 'Smart Casual',
      min_temp: 50,
      max_temp: 80,
      precipitation_resistant: false,
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80',
    },
  ];
}
