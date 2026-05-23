import { type NextRequest, NextResponse } from 'next/server';
import { hasGoogleConnectedCookie, hasGoogleRefreshToken } from '@/lib/googleCalendar';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const connectedCookie = hasGoogleConnectedCookie(req);
  const refreshTokenPresent = hasGoogleRefreshToken(req);
  return NextResponse.json({
    success: true,
    connected: connectedCookie && refreshTokenPresent,
    connectedCookie,
    refreshTokenPresent,
  });
}
