import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client inside the handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || "";
    // MUST use Service Role Key for bypassing RLS, otherwise it will fail with 500 due to our new policies
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials.");
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase credentials.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const oldFileUrl = formData.get('oldFileUrl') as string;

    // Optional cleanup of old file
    if (oldFileUrl && oldFileUrl.includes('nexus_uploads')) {
      try {
        const urlParts = oldFileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from('nexus_uploads')
            .remove([`doctors_profiles/${fileName}`]);

          if (deleteError) {
            console.warn('Failed to delete old file:', deleteError);
          } else {
            console.log('Successfully deleted old file:', fileName);
          }
        }
      } catch (err) {
        console.warn('Error extracting/deleting old file:', err);
      }
    }

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
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `doctors_profiles/${uniqueFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('nexus_uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({
        error: 'Failed to upload file to storage. Check if SUPABASE_SERVICE_ROLE_KEY is set correctly.',
        details: uploadError.message
      }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('nexus_uploads')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      filePath: publicUrlData.publicUrl
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file', details: error.message || String(error) }, { status: 500 });
  }
}
