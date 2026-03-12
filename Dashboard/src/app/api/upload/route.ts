import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth'; // SECURITY FIX: Add getSession
import { z } from 'zod'; // SECURITY FIX: Add Zod
import { isRateLimited } from '@/lib/rateLimit';

// Fully Serverless-compatible universal upload handler using Supabase Storage
export async function POST(request: NextRequest) {
  try {
    // SECURITY FIX: Rate limiting (HIGH #4)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(ip, 20, 15 * 60 * 1000)) {
       return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // SECURITY FIX: Session verification (CRITICAL #1)
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    // SECURITY FIX: Use anon key only, don't expose keys (HIGH #5)
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();
    
    // SECURITY FIX: Input output validation (Zod)
    const uploadInputSchema = z.object({
       file: z.any().refine((val) => typeof val === 'object' && val !== null, "File is required"),
       oldFileUrl: z.string().url().optional().or(z.literal('')).or(z.null()),
       folder: z.string().max(100).optional().or(z.null())
    });

    const validation = uploadInputSchema.safeParse({
       file: formData.get('file'),
       oldFileUrl: formData.get('oldFileUrl'),
       folder: formData.get('folder')
    });

    if (!validation.success) {
       return NextResponse.json({ error: 'Invalid parameters', details: "validation error" }, { status: 400 });
    }

    const file = formData.get('file') as File;
    const oldFileUrl = validation.data.oldFileUrl as string;
    const folder = (validation.data.folder as string) || 'general'; // Default folder

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
      // SECURITY FIX: Do not leak internal generic error details (MEDIUM #8)
      return NextResponse.json({
        error: 'Upload failed. Please try again.'
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
    // SECURITY FIX: Do not leak internal generic error details (MEDIUM #8)
    return NextResponse.json({
      error: 'Internal upload failure. Please try again.'
    }, { status: 500 });
  }
}
