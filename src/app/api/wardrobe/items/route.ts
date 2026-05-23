import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { resolveAppUser } from '@/lib/profile';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const functionName = 'GET /api/wardrobe/items';

  try {
    const { searchParams } = new URL(req.url);
    const { userId } = await resolveAppUser({
      userId: searchParams.get('userId'),
      email: searchParams.get('email'),
      fullName: searchParams.get('fullName'),
      locationCity: searchParams.get('city'),
    });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.warn('Failed to fetch wardrobe items. Returning empty closet so demo wardrobe can be used.', error);
      return NextResponse.json({ success: true, userId, items: [], warning: error.message });
    }

    logger.info(functionName, { userId, count: data?.length || 0 });
    return NextResponse.json({ success: true, userId, items: data || [] });
  } catch (error: any) {
    logger.error('Internal server error in wardrobe item fetch route.', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const functionName = 'DELETE /api/wardrobe/items';

  try {
    const body = await req.json();
    const { id, userId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing wardrobe item id.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('wardrobe_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.warn('Failed to delete wardrobe item in database. UI can still remove local demo items.', error);
      return NextResponse.json({ success: false, warning: error.message });
    }

    logger.info(functionName, { userId, itemId: id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Internal server error in wardrobe delete route.', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const functionName = 'PUT /api/wardrobe/items';

  try {
    const body = await req.json();
    const { id, userId, joy_score, last_worn_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing wardrobe item id.' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const updates: any = {};
    if (joy_score !== undefined) updates.joy_score = joy_score;
    if (last_worn_at !== undefined) updates.last_worn_at = last_worn_at;

    const { data, error } = await admin
      .from('wardrobe_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      logger.warn('Failed to update wardrobe item in database. Column might not exist yet, falling back to UI state only.', error);
      return NextResponse.json({ success: false, warning: error.message });
    }

    logger.info(functionName, { userId, itemId: id, updates });
    return NextResponse.json({ success: true, item: data?.[0] });
  } catch (error: any) {
    logger.error('Internal server error in wardrobe update route.', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
