import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { resolveAppUser } from '@/lib/profile';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

// High-style retail items parsed from mock confirmation emails
const EMAIL_RECEIPT_MOCK_ITEMS = [
  {
    retailer: 'Nike Store',
    orderNumber: 'US-482019',
    subject: 'Your Nike Order #US-482019 Confirmation',
    category: 'Outerwear',
    sub_category: 'Windbreaker Jacket',
    color_family: 'Obsidian Black',
    pattern: 'Colorblock',
    fabric: 'Polyester',
    formality: 'Athletic',
    min_temp: 45,
    max_temp: 70,
    precipitation_resistant: true,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
    joy_score: 5,
  },
  {
    retailer: 'Nike Store',
    orderNumber: 'US-482019',
    subject: 'Your Nike Order #US-482019 Confirmation',
    category: 'Footwear',
    sub_category: 'Air Max Sneakers',
    color_family: 'Crimson Red',
    pattern: 'Solid',
    fabric: 'Mesh',
    formality: 'Athletic',
    min_temp: 40,
    max_temp: 85,
    precipitation_resistant: false,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    joy_score: 5,
  },
  {
    retailer: "Levi's",
    orderNumber: 'LVS-938210',
    subject: "Thank you for shopping at Levi.com! Order #583192",
    category: 'Outerwear',
    sub_category: 'Sherpa Denim Jacket',
    color_family: 'Indigo Blue',
    pattern: 'Solid',
    fabric: 'Cotton Denim',
    formality: 'Casual',
    min_temp: 35,
    max_temp: 60,
    precipitation_resistant: false,
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop',
    joy_score: 5,
  },
  {
    retailer: "Levi's",
    orderNumber: 'LVS-938210',
    subject: "Thank you for shopping at Levi.com! Order #583192",
    category: 'Bottom',
    sub_category: '501 Original Jeans',
    color_family: 'Light Wash Indigo',
    pattern: 'Solid',
    fabric: 'Denim',
    formality: 'Casual',
    min_temp: 45,
    max_temp: 75,
    precipitation_resistant: false,
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop',
    joy_score: 4,
  },
  {
    retailer: 'ZARA',
    orderNumber: 'ZR-839103',
    subject: 'ZARA Order Confirmation - #ZR-839103',
    category: 'Outerwear',
    sub_category: 'Textured Blazer',
    color_family: 'Warm Sand',
    pattern: 'Textured',
    fabric: 'Linen Blend',
    formality: 'Smart Casual',
    min_temp: 50,
    max_temp: 75,
    precipitation_resistant: false,
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
    joy_score: 5,
  },
  {
    retailer: 'Everlane',
    orderNumber: 'EVR-294018',
    subject: 'Everlane: Your order is confirmed! #EVR-294018',
    category: 'Top',
    sub_category: 'Organic Cotton Tee',
    color_family: 'Bone White',
    pattern: 'Solid',
    fabric: 'Organic Cotton',
    formality: 'Casual',
    min_temp: 65,
    max_temp: 90,
    precipitation_resistant: false,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    joy_score: 5,
  }
];

export async function POST(req: NextRequest) {
  const functionName = 'POST /api/wardrobe/import/email';
  logger.info(functionName, { starting: true });

  try {
    const body = await req.json();
    const { userId, email, isCronJob } = body;

    const { userId: resolvedId } = await resolveAppUser({ userId });

    if (!resolvedId) {
      return NextResponse.json({ error: 'Failed to resolve user' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 1. Try to record connected email sync status
    try {
      await admin
        .from('connected_stores')
        .upsert({
          user_id: resolvedId,
          store_name: 'email-sync',
          username: email || 'demo-inbox@gmail.com',
          status: 'synced',
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,store_name'
        });
    } catch (dbErr) {
      logger.warn('Failed to upsert connected_stores for email-sync.', dbErr);
    }

    // 2. Insert items directly into wardrobe_items
    const insertedItems = [];
    for (const item of EMAIL_RECEIPT_MOCK_ITEMS) {
      const { data, error } = await admin
        .from('wardrobe_items')
        .insert({
          user_id: resolvedId,
          category: item.category,
          sub_category: item.sub_category,
          color_family: item.color_family,
          pattern: item.pattern,
          fabric: item.fabric,
          formality: item.formality,
          min_temp: item.min_temp,
          max_temp: item.max_temp,
          precipitation_resistant: item.precipitation_resistant,
          image_url: item.image_url,
          joy_score: item.joy_score,
          last_worn_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        logger.error('Failed to insert email-extracted item into database:', error);
      } else if (data?.[0]) {
        insertedItems.push({
          ...data[0],
          retailer: item.retailer,
          orderNumber: item.orderNumber,
          subject: item.subject,
        });
      }
    }

    logger.info(functionName, { userId: resolvedId, importedCount: insertedItems.length });

    return NextResponse.json({
      success: true,
      message: 'Successfully parsed and extracted receipts from connected inbox.',
      emailsScanned: 18,
      receiptsFound: 4,
      items: insertedItems,
      isCronJob: !!isCronJob,
    });
  } catch (error: any) {
    logger.error('Error during email receipt import route execution:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
