import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOOTD } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * GET /api/ootd/generate
 * Generates a context-aware Outfit of the Day (OOTD) recommendation.
 * Automatically compiles weather, calendar, closet items, and style feedback.
 */
export async function GET(req: NextRequest) {
  const functionName = 'GET /api/ootd/generate';
  logger.info(functionName, { headers: Object.fromEntries(req.headers) });

  try {
    // 1. Resolve User ID (Clerk or query param / mock fallback)
    const { searchParams } = new URL(req.url);
    const customUserId = searchParams.get('userId');
    const cityParam = searchParams.get('city');
    
    // Default mock user ID for hackathon testing
    const userId = customUserId || '00000000-0000-0000-0000-000000000000';

    // 2. Fetch User Profile
    let profile = {
      location_city: 'New York',
      temperature_unit: 'F',
      budget_cap_usd: 100.00
    };

    const { data: dbProfile, error: profileError } = await supabase
      .from('profiles')
      .select('location_city, temperature_unit, budget_cap_usd')
      .eq('id', userId)
      .maybeSingle();

    if (dbProfile) {
      profile = { ...profile, ...dbProfile };
    } else if (profileError) {
      logger.warn('Failed to query user profile. Proceeding with default values.', profileError);
    }

    const targetCity = cityParam || profile.location_city || 'New York';

    // 3. Fetch Weather Data (OpenWeatherMap or Simulated fallback)
    let weatherPayload = {
      city: targetCity,
      temp: 72,
      minTemp: 64,
      maxTemp: 78,
      condition: 'Partly Cloudy',
      precipitationRisk: 10,
      description: 'pleasant gentle breeze, ideal for lightweight layers'
    };

    const weatherApiKey = process.env.WEATHER_API_KEY;
    if (weatherApiKey && weatherApiKey !== 'your_openweather_api_key_here') {
      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(targetCity)}&units=imperial&appid=${weatherApiKey}`;
        const weatherRes = await fetch(weatherUrl);
        if (weatherRes.ok) {
          const rawWeather = await weatherRes.json();
          weatherPayload = {
            city: targetCity,
            temp: Math.round(rawWeather.main.temp),
            minTemp: Math.round(rawWeather.main.temp_min),
            maxTemp: Math.round(rawWeather.main.temp_max),
            condition: rawWeather.weather[0]?.main || 'Clear',
            precipitationRisk: rawWeather.rain ? 80 : 0,
            description: rawWeather.weather[0]?.description || 'clear sky'
          };
          logger.info('Fetched live weather successfully', { weatherPayload });
        } else {
          logger.warn(`Weather API returned error code ${weatherRes.status}. Using simulated weather instead.`);
        }
      } catch (weatherErr) {
        logger.error('Error fetching live weather, falling back to simulation.', weatherErr);
      }
    } else {
      logger.info(functionName, { status: 'Using simulated weather (no API key configured).' });
    }

    // 4. Fetch Calendar Events (Simulated for hackathon demos)
    const calendarPayload = [
      {
        time: '09:30 AM',
        title: 'Project Kickoff & Team Standup',
        description: 'Morning sync with client. Dress code: Smart Casual.'
      },
      {
        time: '01:00 PM',
        title: 'Tech Talk with Google Developers',
        description: 'Casual development session on AI models.'
      },
      {
        time: '07:00 PM',
        title: 'Hackathon Celebration & Social Mixer',
        description: 'Evening party with music and food. Cozy casual attire.'
      }
    ];

    // 5. Fetch User Closet (Wardrobe Items) from Supabase
    const { data: closet, error: closetError } = await supabase
      .from('wardrobe_items')
      .select('id, category, sub_category, color_family, pattern, fabric, formality, min_temp, max_temp, precipitation_resistant, image_url')
      .eq('user_id', userId);

    if (closetError) {
      logger.error('Failed to query user wardrobe items.', closetError);
      return NextResponse.json(
        { error: `Database Error: ${closetError.message}` },
        { status: 500 }
      );
    }

    // 6. Fetch User Past Feedbacks (Likes/Dislikes)
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from('user_feedbacks')
      .select('outfit_item_ids, liked, dislike_reason')
      .eq('user_id', userId)
      .limit(20);

    if (feedbacksError) {
      logger.warn('Failed to query style feedback history.', feedbacksError);
    }

    // 7. If closet is empty, we must provide some fallback mock items so the API works
    const finalCloset = closet && closet.length > 0 ? closet : [
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
        image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        category: 'Bottom',
        sub_category: 'Chinos',
        color_family: 'Beige',
        pattern: 'Solid',
        fabric: 'Cotton Blend',
        formality: 'Casual',
        min_temp: 50,
        max_temp: 80,
        precipitation_resistant: false,
        image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        category: 'Outerwear',
        sub_category: 'Blazer',
        color_family: 'Navy Blue',
        pattern: 'Solid',
        fabric: 'Linen',
        formality: 'Formal',
        min_temp: 55,
        max_temp: 75,
        precipitation_resistant: false,
        image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=300&q=80'
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        category: 'Footwear',
        sub_category: 'Chelsea Boots',
        color_family: 'Brown',
        pattern: 'Solid',
        fabric: 'Suede',
        formality: 'Smart Casual',
        min_temp: 40,
        max_temp: 70,
        precipitation_resistant: true,
        image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=300&q=80'
      }
    ];

    // 8. Call Gemini Planner to synthesize outfit recommendations
    const ootdResult = await generateOOTD(
      weatherPayload,
      calendarPayload,
      finalCloset,
      feedbacks || []
    );

    // 9. Enrich the result outfit items with their image URLs
    const outfitsWithImages = ootdResult.outfits.map((outfit: any) => {
      const enrichedItems = outfit.items.map((item: any) => {
        const matchingClosetItem = finalCloset.find(c => c.id === item.id);
        return {
          ...item,
          imageUrl: matchingClosetItem ? matchingClosetItem.image_url : null
        };
      });
      return {
        ...outfit,
        items: enrichedItems
      };
    });

    logger.info(functionName, { success: true, outfitsGenerated: outfitsWithImages.length });

    return NextResponse.json({
      success: true,
      weather: weatherPayload,
      calendar: calendarPayload,
      outfits: outfitsWithImages,
      isDemoCloset: !closet || closet.length === 0
    });

  } catch (error: any) {
    logger.error('Internal server error in OOTD generation route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
