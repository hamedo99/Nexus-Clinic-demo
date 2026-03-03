require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || supabaseKey);

async function testUpload() {
    console.log("URL:", supabaseUrl);
    const fileContent = "Hello World";
    const { data, error } = await supabase.storage.from('nexus_uploads').upload('test/test.txt', fileContent, { upsert: true, contentType: 'text/plain' });
    console.log("Upload result:");
    console.log(error || data);
}

testUpload();
