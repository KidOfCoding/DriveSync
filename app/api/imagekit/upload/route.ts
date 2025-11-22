import { NextRequest, NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'rides';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const result = await imagekit.upload({
      file: base64,
      fileName: file.name,
      folder: folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({ url: result.url, fileId: result.fileId });
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

