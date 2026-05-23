import { type NextRequest, NextResponse } from 'next/server';
import { resolveAppUser } from '@/lib/profile';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const functionName = 'POST /api/profile';

  try {
    const body = await req.json();
    const { userProfile, userId } = body;
    const result = await resolveAppUser({
      userId,
      fullName: userProfile?.fullName,
      email: userProfile?.email,
      locationCity: userProfile?.locationCity,
      budgetLimit: userProfile?.budgetLimit,
    });

    logger.info(functionName, { userId: result.userId, email: result.profile.email });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    logger.error('Failed to sync profile.', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
