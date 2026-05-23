import { type NextRequest, NextResponse } from 'next/server';
import { fetchGoogleCalendarEvents } from '@/lib/googleCalendar';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const result = await fetchGoogleCalendarEvents(req);
  logger.info('GET /api/google/events', {
    connected: result.connected,
    events: result.events.length,
    error: result.error,
  });
  return NextResponse.json({ success: true, ...result });
}
