import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateOOTD } from '@/lib/gemini';
import { logger } from '@/lib/logger';
import { resolveAppUser } from '@/lib/profile';
import { fetchWeather } from '@/lib/weather';
import { fetchGoogleCalendarEvents } from '@/lib/googleCalendar';
import type { CalendarEventPayload, WardrobeItemRecord } from '@/lib/ootdUtils';

export const runtime = 'nodejs';

/**
 * GET/POST /api/ootd/generate
 * Compiles live weather, Google Calendar events, closet items, and feedback,
 * then asks Gemini for a personalized Outfit of the Day.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return generateForRequest(req, {
    userId: searchParams.get('userId'),
    userProfile: {
      email: searchParams.get('email'),
      fullName: searchParams.get('fullName'),
      locationCity: searchParams.get('city'),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return generateForRequest(req, body);
}

async function generateForRequest(req: NextRequest, body: any) {
  const functionName = 'API /api/ootd/generate';
  logger.info(functionName, {
    userId: body?.userId,
    email: body?.userProfile?.email,
    city: body?.userProfile?.locationCity,
    providedClosetItems: body?.closetItems?.length || 0,
  });

  try {
    const profileInput = {
      userId: body?.userId,
      fullName: body?.userProfile?.fullName,
      email: body?.userProfile?.email,
      locationCity: body?.userProfile?.locationCity,
      budgetLimit: body?.userProfile?.budgetLimit,
    };
    const { userId, profile } = await resolveAppUser(profileInput);
    const targetCity = body?.userProfile?.locationCity || profile.location_city || 'New York';

    const [weatherPayload, calendarResult, closet, feedbacks] = await Promise.all([
      fetchWeather(targetCity),
      fetchGoogleCalendarEvents(req),
      fetchCloset(userId, body?.closetItems || []),
      fetchFeedbacks(userId),
    ]);

    const calendarPayload =
      calendarResult.events.length > 0
        ? calendarResult.events
        : buildNoCalendarFallback(calendarResult.connected, calendarResult.error);

    const ootdResult = await generateOOTD(
      weatherPayload,
      calendarPayload,
      closet.items,
      feedbacks
    );

    logger.info(functionName, {
      success: true,
      outfitsGenerated: ootdResult.outfits?.length || 0,
      calendarConnected: calendarResult.connected,
      calendarEvents: calendarResult.events.length,
      weatherSource: weatherPayload.source,
      closetSource: closet.source,
    });

    return NextResponse.json({
      success: true,
      userId,
      weather: weatherPayload,
      calendar: calendarPayload,
      calendarConnected: calendarResult.connected,
      calendarError: calendarResult.error || null,
      outfits: ootdResult.outfits || [],
      plannerSource: ootdResult.plannerSource || 'gemini',
      isDemoCloset: closet.source !== 'database',
      closetSource: closet.source,
    });
  } catch (error: any) {
    logger.error('Internal server error in OOTD generation route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}

async function fetchCloset(userId: string, providedCloset: WardrobeItemRecord[]) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('wardrobe_items')
    .select('id, category, sub_category, color_family, pattern, fabric, formality, min_temp, max_temp, precipitation_resistant, image_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.warn('Failed to query wardrobe items. Falling back to provided closet payload.', error);
  }

  if (data && data.length > 0) {
    return { items: data as WardrobeItemRecord[], source: 'database' };
  }

  if (providedCloset.length > 0) {
    return { items: providedCloset, source: 'client-demo' };
  }

  return { items: buildEmergencyCloset(), source: 'emergency-demo' };
}

async function fetchFeedbacks(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('user_feedbacks')
    .select('outfit_item_ids, liked, dislike_reason')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    logger.warn('Failed to query style feedback history.', error);
    return [];
  }

  return data || [];
}

function buildNoCalendarFallback(connected: boolean, error?: string): CalendarEventPayload[] {
  if (connected && error) {
    return [
      {
        time: 'Today',
        title: 'Calendar connected, but events could not be read',
        description: error,
        source: 'google-error',
      },
    ];
  }

  return [
    {
      time: 'Today',
      title: connected ? 'No events on your calendar today' : 'Calendar not connected',
      description: connected
        ? 'The planner will optimize for weather and your closet because your schedule is open.'
        : 'Connect Google Calendar to include meetings, travel, meals, workouts, and social plans.',
      source: connected ? 'google-empty' : 'not-connected',
    },
  ];
}

function buildEmergencyCloset(): WardrobeItemRecord[] {
  return [
    {
      id: '11111111-1111-1111-1111-111111111111',
      category: 'Top',
      sub_category: 'Knit Sweater',
      color_family: 'Charcoal Gray',
      pattern: 'Solid',
      fabric: 'Merino Wool',
      formality: 'Smart Casual',
      min_temp: 45,
      max_temp: 65,
      precipitation_resistant: false,
      image_url: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=300&q=80',
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
    {
      id: '33333333-3333-3333-3333-333333333333',
      category: 'Outerwear',
      sub_category: 'Trench Coat',
      color_family: 'Beige',
      pattern: 'Solid',
      fabric: 'Cotton Gabardine',
      formality: 'Smart Casual',
      min_temp: 40,
      max_temp: 65,
      precipitation_resistant: true,
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      category: 'Footwear',
      sub_category: 'Chelsea Boots',
      color_family: 'Tan Brown',
      pattern: 'Solid',
      fabric: 'Suede',
      formality: 'Smart Casual',
      min_temp: 40,
      max_temp: 70,
      precipitation_resistant: true,
      image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=300&q=80',
    },
  ];
}
