import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendStyleDigestEmail } from '@/lib/email';
import type { CalendarEventPayload, PlannerOutfit, WeatherPayload } from '@/lib/ootdUtils';

export const runtime = 'nodejs';

/**
 * POST /api/ootd/send
 * Dispatches the currently generated style digest through Resend.
 */
export async function POST(req: NextRequest) {
  const functionName = 'POST /api/ootd/send';

  try {
    const body = await req.json();
    const { email, ootdResult, userProfile } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required to dispatch the style digest.' },
        { status: 400 }
      );
    }

    if (!ootdResult) {
      return NextResponse.json(
        { error: 'No outfit digest was provided. Generate an outfit before sending email.' },
        { status: 400 }
      );
    }

    const weather = normalizeWeather(body.weather, ootdResult, userProfile);
    const calendar = normalizeCalendar(body.calendar, ootdResult);
    const outfit = normalizeOutfit(ootdResult);

    logger.info(functionName, {
      email,
      city: userProfile?.locationCity || weather.city,
      context: outfit.context,
      items: outfit.items?.length || 0,
    });

    const result = await sendStyleDigestEmail({
      to: email,
      fullName: userProfile?.fullName,
      city: userProfile?.locationCity || weather.city,
      weather,
      calendar,
      outfit,
    });

    if (!result.success && !result.simulated) {
      return NextResponse.json({ error: result.error || 'Resend dispatch failed.' }, { status: result.status || 502 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error('Internal server error in send route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}

function normalizeWeather(weather: WeatherPayload | undefined, ootdResult: any, userProfile: any): WeatherPayload {
  if (weather?.city) return weather;

  const city = userProfile?.locationCity || 'New York';
  const match = String(ootdResult?.weather || '').match(/(-?\d+)°F\s*•\s*([^i]+)/);
  return {
    city,
    temp: match ? Number(match[1]) : 72,
    minTemp: match ? Number(match[1]) : 64,
    maxTemp: match ? Number(match[1]) : 78,
    condition: match ? match[2].trim() : 'Mild',
    precipitationRisk: 0,
    description: 'Digest weather context',
    source: 'digest',
  };
}

function normalizeCalendar(calendar: CalendarEventPayload[] | undefined, ootdResult: any): CalendarEventPayload[] {
  if (Array.isArray(calendar) && calendar.length) return calendar;
  return [
    {
      time: 'Today',
      title: ootdResult?.schedule || ootdResult?.scenario || ootdResult?.context || 'Daily style plan',
      description: '',
      source: 'digest',
    },
  ];
}

function normalizeOutfit(ootdResult: any): PlannerOutfit {
  return {
    context: ootdResult.context || ootdResult.scenario || 'Daily style plan',
    scenario: ootdResult.scenario || ootdResult.context || 'Daily style plan',
    schedule: ootdResult.schedule,
    weather: ootdResult.weather,
    items: Array.isArray(ootdResult.items)
      ? ootdResult.items.map((item: any) =>
          typeof item === 'string'
            ? { id: item, category: 'Closet', subCategory: 'Wardrobe piece' }
            : {
                id: item.id,
                category: item.category || 'Closet',
                subCategory: item.subCategory || item.sub_category || 'Wardrobe piece',
                imageUrl: item.imageUrl || item.image_url || null,
              }
        )
      : [],
    stylingReasoning: ootdResult.stylingReasoning || ootdResult.reasoning || 'A custom curated outfit for your day.',
    reasoning: ootdResult.reasoning || ootdResult.stylingReasoning || 'A custom curated outfit for your day.',
  };
}
