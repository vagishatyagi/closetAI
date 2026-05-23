import { type NextRequest, NextResponse } from 'next/server';
import { decodeGoogleState, exchangeCodeForGoogleTokens, setGoogleCalendarCookies } from '@/lib/googleCalendar';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const returnTo = decodeGoogleState(req.nextUrl.searchParams.get('state'));
  const redirectUrl = new URL(returnTo, req.url);

  if (error) {
    redirectUrl.searchParams.set('calendar', 'error');
    redirectUrl.searchParams.set('calendarError', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set('calendar', 'error');
    redirectUrl.searchParams.set('calendarError', 'missing_code');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokens = await exchangeCodeForGoogleTokens(req, code);
    if (!tokens.refresh_token) {
      redirectUrl.searchParams.set('calendar', 'error');
      redirectUrl.searchParams.set('calendarError', 'missing_refresh_token');
      return NextResponse.redirect(redirectUrl);
    }

    redirectUrl.searchParams.set('calendar', 'connected');
    const response = NextResponse.redirect(redirectUrl);
    setGoogleCalendarCookies(response, tokens.refresh_token);
    logger.info('GET /api/google/callback', { success: true, returnTo });
    return response;
  } catch (callbackError: any) {
    logger.error('Google OAuth callback failed.', callbackError);
    redirectUrl.searchParams.set('calendar', 'error');
    redirectUrl.searchParams.set('calendarError', callbackError.message);
    return NextResponse.redirect(redirectUrl);
  }
}
