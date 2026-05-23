import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/wardrobe/upload
 * Accepts a multipart form-data payload containing a 'file' parameter.
 * Uploads the raw binary image to the Supabase 'wardrobe' storage bucket.
 */
export async function POST(req: NextRequest) {
  const functionName = 'POST /api/wardrobe/upload';
  logger.info(functionName, { headers: Object.fromEntries(req.headers) });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      logger.warn('Upload attempted without a file parameter.');
      return NextResponse.json(
        { error: 'Bad Request: Missing "file" parameter in form-data.' },
        { status: 400 }
      );
    }

    logger.info(functionName, {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    // 1. Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported Media Type: Allowed types are JPEG, PNG, WEBP, and HEIC.` },
        { status: 415 }
      );
    }

    // 2. Convert File object into Buffer for Supabase Upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. User Resolution (Clerk session extraction fallback for easy local test)
    // For local hackathon dev, fall back to a mock user UUID if no session is set up
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    const userId = mockUserId; // Clerk / Auth wrapper will inject actual user UUID here later

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storagePath = `users/${userId}/closet-${uniqueId}.${fileExtension}`;

    // 4. Upload to Supabase Storage
    // Note: Bucket name must be "wardrobe" and set to public in your Supabase dashboard
    const { data, error } = await supabase.storage
      .from('wardrobe')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      logger.error('Supabase storage upload failed', error);
      
      // Graceful instruction error if bucket does not exist yet
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            error: 'Bucket Not Found: Please create a public storage bucket named "wardrobe" in your Supabase dashboard.',
            instructions: 'Log into Supabase, go to Storage, click "New Bucket", name it "wardrobe", and set it to Public.'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `Database storage upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // 5. Generate the Public Retrieval URL
    const { data: { publicUrl } } = supabase.storage
      .from('wardrobe')
      .getPublicUrl(storagePath);

    logger.info(functionName, { success: true, path: storagePath, publicUrl });

    return NextResponse.json({
      success: true,
      path: storagePath,
      publicUrl,
      userId,
    });
  } catch (error: any) {
    logger.error('Internal server error in upload route', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
