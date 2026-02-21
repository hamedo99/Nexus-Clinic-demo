import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type (must be an image)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

    // Save to public/uploads/doctors_profiles
    const uploadPath = join(process.cwd(), 'public', 'uploads', 'doctors_profiles', uniqueFilename);

    await writeFile(uploadPath, buffer);

    // Return the file path relative to public directory
    const filePath = `/uploads/doctors_profiles/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      filePath: filePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
