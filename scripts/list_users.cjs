const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 에서 정보 읽기
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
    console.log('--- Supabase Users List ---');
    const { data, error, count } = await supabase
        .from('users')
        .select('id, login_id, name, role, status', { count: 'exact' });

    if (error) {
        console.error('Error fetching users:', error.message);
        return;
    }

    console.log(`Total Users Found: ${count}`);
    if (data && data.length > 0) {
        data.forEach((u, i) => {
            console.log(`${i + 1}. [${u.login_id}] ${u.name || 'No Name'} (Role: ${u.role}, Status: ${u.status})`);
        });
        console.log('\n* 로그인 시 위 [아이디]와 생성 시 설정한 비밀번호를 사용하세요.');
    } else {
        console.log('No users found in the database.');
    }
}

listUsers();
