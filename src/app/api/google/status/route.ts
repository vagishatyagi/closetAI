import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const connected = req.cookies.get('closet_google_calendar_connected')?.value === '1';
  return NextResponse.json({ success: true, connected });
}
