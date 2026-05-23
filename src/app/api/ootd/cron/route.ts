import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOOTD } from '@/lib/gemini';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/ootd/cron
 * Cron worker endpoint. Intended to be triggered daily by Vercel Scheduler
 * to dispatch context-aware email newsletters via Resend to all registered users.
 */
export async function POST(req: NextRequest) {
  const functionName = 'POST /api/ootd/cron';
  logger.info(functionName, { headers: Object.fromEntries(req.headers) });

  try {
    // 1. Verify Vercel Cron Security Handshake
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized attempt to trigger cron scheduler.');
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid cron scheduler credentials.' },
        { status: 401 }
      );
    }

    // 2. Fetch all registered user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, location_city, temperature_unit');

    if (profilesError) {
      logger.error('Failed to retrieve user profiles for cron dispatch.', profilesError);
      return NextResponse.json(
        { error: `Database Error: ${profilesError.message}` },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      logger.info(functionName, { status: 'No user profiles found. Dispatch cancelled.' });
      return NextResponse.json({
        success: true,
        dispatchedCount: 0,
        message: 'No registered profiles in the database.'
      });
    }

    logger.info(functionName, { totalProfilesToProcess: profiles.length });

    // 3. For each profile, run synthesis and simulate/execute email dispatch
    const resendApiKey = process.env.RESEND_API_KEY;
    const dispatchResults = [];

    for (const profile of profiles) {
      try {
        const userId = profile.id;
        const targetCity = profile.location_city || 'New York';

        // A. Fetch Weather (Simulated default)
        const weatherPayload = {
          city: targetCity,
          temp: 68,
          minTemp: 58,
          maxTemp: 74,
          condition: 'Clear Sky',
          precipitationRisk: 0,
          description: 'clear sky, gentle breeze'
        };

        // B. Fetch Calendar Events (Simulated default)
        const calendarPayload = [
          {
            time: '09:00 AM',
            title: 'Daily Standup',
            description: 'Regular sync.'
          },
          {
            time: '12:00 PM',
            title: 'Lunch with Mentor',
            description: 'Casual outdoor dining.'
          }
        ];

        // C. Fetch Closet Items
        const { data: closet } = await supabase
          .from('wardrobe_items')
          .select('id, category, sub_category, color_family, pattern, fabric, formality, min_temp, max_temp, precipitation_resistant, image_url')
          .eq('user_id', userId);

        const finalCloset = closet && closet.length > 0 ? closet : [
          {
            id: '11111111-1111-1111-1111-111111111111',
            category: 'Top',
            sub_category: 'Polo Shirt',
            color_family: 'Navy Blue',
            pattern: 'Solid',
            fabric: 'Cotton',
            formality: 'Smart Casual',
            min_temp: 60,
            max_temp: 85,
            precipitation_resistant: false,
            image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80'
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
          }
        ];

        // D. Generate OOTD synthesis using Gemini
        const ootdResult = await generateOOTD(
          weatherPayload,
          calendarPayload,
          finalCloset,
          []
        );

        const primaryOutfit = ootdResult.outfits[0];
        const reasoning = primaryOutfit?.stylingReasoning || 'A custom curated outfit for your day!';

        // E. Build beautiful email HTML
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Your Outfit of the Day</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9fb; color: #1e1e24; margin: 0; padding: 20px; }
                .card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto; overflow: hidden; border: 1px solid #e1e1e6; }
                .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
                .content { padding: 30px; }
                .meta { display: flex; justify-content: space-between; border-bottom: 1px solid #e1e1e6; padding-bottom: 20px; margin-bottom: 20px; }
                .meta-item { font-size: 14px; color: #6b7280; }
                .meta-item strong { color: #1f2937; }
                .reasoning { background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 0 8px 8px 0; font-style: italic; margin-bottom: 25px; line-height: 1.6; }
                .item-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
                .item-card { border: 1px solid #e1e1e6; border-radius: 12px; padding: 10px; text-align: center; background-color: #fafafb; }
                .item-img { max-width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }
                .item-title { font-weight: 600; font-size: 14px; color: #1f2937; margin: 5px 0; }
                .item-subtitle { font-size: 12px; color: #6b7280; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #9ca3af; background-color: #fafafb; border-top: 1px solid #e1e1e6; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <h1>WARDROBE AI</h1>
                  <p style="margin: 5px 0 0; opacity: 0.9;">Your Daily Personalized Digital Stylist</p>
                </div>
                <div class="content">
                  <p>Good morning, <strong>${profile.full_name || 'Stylish Friend'}</strong>!</p>
                  <p>Here is your hyper-personalized Outfit of the Day tailored specifically to your schedule and the local weather forecast.</p>
                  
                  <div class="meta">
                    <div class="meta-item">🌤️ Weather: <strong>${weatherPayload.temp}°F, ${weatherPayload.condition}</strong></div>
                    <div class="meta-item">📍 City: <strong>${weatherPayload.city}</strong></div>
                  </div>

                  <div class="reasoning">
                    "${reasoning}"
                  </div>

                  <h3 style="margin-top: 0; border-bottom: 1px solid #e1e1e6; padding-bottom: 10px; font-size: 16px;">OOTD Suggested Pieces</h3>
                  <div class="item-grid">
                    ${primaryOutfit?.items.map((item: any) => {
                      const details = finalCloset.find(c => c.id === item.id) || item;
                      return `
                        <div class="item-card">
                          <img class="item-img" src="${details.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=150&q=80'}" alt="${details.sub_category}">
                          <div class="item-title">${details.sub_category || item.subCategory}</div>
                          <div class="item-subtitle">${details.color_family || 'Classic'} • ${details.category}</div>
                        </div>
                      `;
                    }).join('') || '<p>No pieces curated today.</p>'}
                  </div>
                </div>
                <div class="footer">
                  Generated autonomously with Google Gemini 3.1 Pro & Supabase. <br>
                  © 2026 ClosetAI Inc. All Rights Reserved.
                </div>
              </div>
            </body>
          </html>
        `;

        // F. Send Email via Resend if Key is configured
        let emailSentStatus = 'Simulated (No Resend API Key)';
        if (resendApiKey && resendApiKey !== 're_your_resend_api_key') {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: 'ClosetAI <onboarding@resend.dev>',
              to: 'vagisha.tyagi001@gmail.com', // For Hackathon, default to sandbox recipient
              subject: `🌤️ Your ClosetAI Styling Digest - ${weatherPayload.temp}°F & ${weatherPayload.condition}`,
              html: emailHtml
            })
          });

          if (resendResponse.ok) {
            emailSentStatus = 'Sent Successfully';
          } else {
            const errBody = await resendResponse.text();
            emailSentStatus = `Failed: ${errBody}`;
            logger.warn(`Failed to dispatch email via Resend to ${profile.full_name}`, { error: errBody });
          }
        }

        dispatchResults.push({
          userId,
          fullName: profile.full_name,
          emailStatus: emailSentStatus,
          primaryOotdContext: primaryOutfit?.context || 'Daily Stylist Curation'
        });

      } catch (profileError: any) {
        logger.error(`Error processing cron styling digest for profile ${profile.id}`, profileError);
        dispatchResults.push({
          userId: profile.id,
          fullName: profile.full_name,
          emailStatus: `Error: ${profileError.message}`
        });
      }
    }

    logger.info(functionName, { success: true, totalProcessed: dispatchResults.length, dispatchResults });

    return NextResponse.json({
      success: true,
      totalProcessed: dispatchResults.length,
      dispatchResults
    });

  } catch (error: any) {
    logger.error('Internal server error in cron dispatch route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
