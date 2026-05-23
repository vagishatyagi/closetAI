import { NextResponse } from 'next/server';
import { clearGoogleCalendarCookies } from '@/lib/googleCalendar';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true, connected: false });
  clearGoogleCalendarCookies(response);
  logger.info('POST /api/google/disconnect', { success: true });
  return response;
}
