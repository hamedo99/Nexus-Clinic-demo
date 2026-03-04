import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fully Serverless-compatible universal upload handler using Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // Ensure we use the best available key for uploads (Service Role > Default Publishable > Anon)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const oldFileUrl = formData.get('oldFileUrl') as string;
    const folder = (formData.get('folder') as string) || 'general'; // Default folder

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Optional cleanup of old file if it belongs to our bucket
    if (oldFileUrl && oldFileUrl.includes('nexus_uploads')) {
      try {
        const urlParts = oldFileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await supabase.storage
            .from('nexus_uploads')
            .remove([`${folder}/${fileName}`]);
        }
      } catch (err) {
        console.warn('Cleanup of old file failed or was skipped:', err);
      }
    }

    // 2. Prepare file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${folder}/${uniqueFilename}`;

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('nexus_uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false // We use unique UUIDs, so no need for upsert
      });

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      return NextResponse.json({
        error: 'Failed to upload to storage',
        details: uploadError.message
      }, { status: 500 });
    }

    // 5. Get and return the public URL
    const { data: publicUrlData } = supabase.storage
      .from('nexus_uploads')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      filePath: publicUrlData.publicUrl,
      fileName: uniqueFilename
    });

  } catch (error: any) {
    console.error('Global upload handler error:', error);
    return NextResponse.json({
      error: 'Internal upload failure',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
