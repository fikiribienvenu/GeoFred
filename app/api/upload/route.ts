import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { uploadImage } from '@/lib/cloudinary';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image, folder } = body;

    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 });

    const result = await uploadImage(image, folder || 'geofred-terra');
    return NextResponse.json({ success: true, url: result.url, publicId: result.publicId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
