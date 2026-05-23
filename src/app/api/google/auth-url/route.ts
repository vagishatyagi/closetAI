import { type NextRequest, NextResponse } from 'next/server';
import { buildGoogleAuthUrl } from '@/lib/googleCalendar';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const returnTo = req.nextUrl.searchParams.get('returnTo') || '/';
    const url = buildGoogleAuthUrl(req, returnTo);
    logger.info('GET /api/google/auth-url', { returnTo });
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    logger.error('Failed to build Google auth URL.', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
