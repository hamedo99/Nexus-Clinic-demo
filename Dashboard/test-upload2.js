require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || supabaseKey);

async function testUpload() {
    const fileContent = "dummy image content";
    const { data, error } = await supabase.storage.from('nexus_uploads').upload('test/test.png', fileContent, { upsert: true, contentType: 'image/png' });
    console.log("Upload result:", error || data);
}

testUpload();
