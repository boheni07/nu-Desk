
import { createClient } from '@supabase/supabase-js';

// --- 설정 가이드 ---
// 이 스크립트를 로컬에서 실행하여 Supabase DB에 초기 관리자 계정을 생성할 수 있습니다.
// 1. 아래 URL과 ANON_KEY를 본인의 Supabase 정보로 수정하세요.
// 2. 터미널에서 'node scripts/create_admin.js' 명령어를 실행하세요.
const SUPABASE_URL = '여기에_SUPABASE_URL_입력';
const SUPABASE_ANON_KEY = '여기에_SUPABASE_ANON_KEY_입력';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
    console.log('--- 초기 관리자 계정 생성 시작 ---');

    if (SUPABASE_URL.includes('여기에')) {
        console.error('[ERORR] SUPABASE_URL과 ANON_KEY를 먼저 설정해 주세요.');
        return;
    }

    const adminUser = {
        id: 'u-admin-init',
        login_id: 'admin',
        password: '0000',
        name: '초기 관리자',
        role: 'ADMIN',
        status: '활성',
        mobile: '010-0000-0000',
        email: 'admin@example.com'
    };

    console.log(`Checking if admin '${adminUser.login_id}' exists...`);
    const { data: existing } = await supabase.from('users').select('id').eq('login_id', adminUser.login_id).single();

    if (existing) {
        console.log(`[INFO] '${adminUser.login_id}' 계정이 이미 존재합니다.`);
    } else {
        const { error } = await supabase.from('users').insert(adminUser);
        if (error) {
            console.error('[ERROR] 관리자 생성 실패:', error.message);
        } else {
            console.log('[SUCCESS] admin / 0000 계정이 성공적으로 생성되었습니다!');
        }
    }
}

createAdmin();
