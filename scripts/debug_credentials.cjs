const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 에서 정보 읽기
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyCredentials() {
    console.log('--- Supabase Credentials Verification ---');
    const { data, error } = await supabase
        .from('users')
        .select('login_id, password, name');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        data.forEach((u, i) => {
            console.log(`${i + 1}. ID: [${u.login_id}], PW: [${u.password}], Name: ${u.name}`);
        });
    } else {
        console.log('No users found.');
    }
}

verifyCredentials();
