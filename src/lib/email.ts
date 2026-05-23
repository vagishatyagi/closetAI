import { logger } from "./logger";
import { formatScheduleLabel, formatWeatherLabel, type CalendarEventPayload, type PlannerOutfit, type WeatherPayload } from "./ootdUtils";

export interface StyleDigestInput {
  to: string;
  fullName?: string;
  city?: string;
  weather: WeatherPayload;
  calendar: CalendarEventPayload[];
  outfit: PlannerOutfit;
}

export async function sendStyleDigestEmail(input: StyleDigestInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || resendApiKey === "re_your_resend_api_key") {
    return {
      success: false,
      simulated: true,
      message: "Resend API key is not configured. Email HTML was generated but not sent.",
    };
  }

  const html = buildStyleDigestEmail(input);
  const subject = `Your Closet Companion digest - ${formatWeatherLabel(input.weather)}`;
  const from = process.env.RESEND_FROM_EMAIL || "Closet Companion <onboarding@resend.dev>";
  const payload = { from, subject, html };

  const firstAttempt = await postResendEmail(resendApiKey, { ...payload, to: [input.to] });

  if (!firstAttempt.ok) {
    const errorMessage = typeof firstAttempt.body === "string" ? firstAttempt.body : firstAttempt.body?.message || "Resend dispatch failed.";
    const sandboxRecipient = process.env.RESEND_TEST_RECIPIENT || "devstar7440@gcplab.me";

    if (/only send testing emails/i.test(errorMessage) && sandboxRecipient && sandboxRecipient !== input.to) {
      const retryAttempt = await postResendEmail(resendApiKey, { ...payload, to: [sandboxRecipient] });
      if (retryAttempt.ok) {
        return {
          success: true,
          message: `Resend sandbox delivered the digest to ${sandboxRecipient}. Verify a Resend domain to send directly to ${input.to}.`,
          providerId: retryAttempt.body?.id,
          deliveredTo: sandboxRecipient,
          requestedTo: input.to,
          sandboxFallback: true,
        };
      }
    }

    logger.error("Failed to dispatch email via Resend", { status: firstAttempt.status, responseBody: firstAttempt.body });
    return {
      success: false,
      error: errorMessage,
      status: firstAttempt.status,
    };
  }

  return {
    success: true,
    message: `Curated style digest successfully sent to ${input.to}.`,
    providerId: firstAttempt.body?.id,
  };
}

async function postResendEmail(apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let body: any = responseText;
  try {
    body = JSON.parse(responseText);
  } catch {
    // Resend can return plain text for some gateway failures.
  }

  return { ok: response.ok, status: response.status, body };
}

export function buildStyleDigestEmail({ fullName, city, weather, calendar, outfit }: StyleDigestInput) {
  const pieces = outfit.items || [];
  const schedule = formatScheduleLabel(calendar);
  const weatherLabel = formatWeatherLabel(weather);
  const reasoning = outfit.stylingReasoning || outfit.reasoning || "A custom curated outfit for your day.";
  const safeName = escapeHtml(fullName || "Style Partner");
  const safeCity = escapeHtml(city || weather.city);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your Outfit of the Day</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #172033; margin: 0; padding: 24px; }
          .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; max-width: 640px; margin: 0 auto; overflow: hidden; }
          .header { background: #241b33; padding: 28px; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; line-height: 1.2; }
          .header p { margin: 8px 0 0; color: #d8c8f5; font-size: 14px; }
          .content { padding: 28px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
          .meta-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; font-size: 13px; }
          .label { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; margin-bottom: 4px; }
          .reasoning { border-left: 4px solid #7c3aed; background: #f5f3ff; color: #312e54; padding: 14px 16px; border-radius: 8px; line-height: 1.55; }
          .item-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 18px; }
          .item-card { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff; }
          .item-img { width: 100%; height: 160px; object-fit: cover; background: #f1f5f9; display: block; }
          .item-body { padding: 12px; }
          .item-title { font-weight: 700; font-size: 14px; color: #172033; margin: 0; }
          .item-subtitle { font-size: 12px; color: #64748b; margin: 4px 0 0; }
          .footer { padding: 18px 28px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
          @media (max-width: 560px) { .meta, .item-grid { grid-template-columns: 1fr; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>Closet Companion</h1>
            <p>A mindful outfit plan for the day ahead.</p>
          </div>
          <div class="content">
            <p>Good morning, <strong>${safeName}</strong>.</p>
            <p>Your outfit is based on today&apos;s live weather, calendar context, and the pieces available in your closet.</p>
            <div class="meta">
              <div class="meta-item"><span class="label">Weather</span>${escapeHtml(weatherLabel)}</div>
              <div class="meta-item"><span class="label">Location</span>${safeCity}</div>
              <div class="meta-item"><span class="label">Schedule</span>${escapeHtml(schedule)}</div>
              <div class="meta-item"><span class="label">Context</span>${escapeHtml(outfit.context || outfit.scenario || "Daily style plan")}</div>
            </div>
            <div class="reasoning">${escapeHtml(reasoning)}</div>
            <div class="item-grid">
              ${
                pieces.length
                  ? pieces
                      .map(
                        (item) => {
                          const imageUrl = item.imageUrl || (item as any).image_url;
                          const subCategory = item.subCategory || (item as any).sub_category || "Wardrobe piece";
                          const category = item.category || "Closet item";
                          return `
                            <div class="item-card">
                              ${imageUrl ? `<img class="item-img" src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(subCategory)}">` : ""}
                              <div class="item-body">
                                <p class="item-title">${escapeHtml(subCategory)}</p>
                                <p class="item-subtitle">${escapeHtml(category)}</p>
                              </div>
                            </div>
                          `;
                        }
                      )
                      .join("")
                  : "<p>No pieces were selected today.</p>"
              }
            </div>
          </div>
          <div class="footer">Generated with your wardrobe, Google Calendar, local weather, and Gemini styling.</div>
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
