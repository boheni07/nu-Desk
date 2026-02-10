const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 에서 정보 읽기
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateProject() {
    console.log('--- Testing Project Creation ---');

    // toDbData와 동일한 정제 로직 적용 테스트
    const toDbData = (data) => {
        const cleaned = {};
        Object.keys(data).forEach(key => {
            const val = data[key];
            cleaned[key] = val === '' ? null : val;
        });
        return cleaned;
    };

    const testProject = toDbData({
        id: `p_fix_test_${Date.now()}`,
        name: 'Fix Test Project ' + new Date().toISOString(),
        client_id: 'c1738048225883',
        description: 'Testing fixed toDbData logic',
        start_date: '', // 빈 문자열 -> null로 변환되어야 함
        end_date: '',
        status: '활성',
        customer_contact_ids: [],
        support_staff_ids: []
    });

    console.log('Attempting to insert project with empty dates...');
    const { error } = await supabase.from('projects').insert(testProject);

    if (error) {
        console.error('[ERROR] Project Insertion Failed:', error.message);
        console.error('Details:', error);

        if (error.message.includes('invalid input syntax for type timestamp')) {
            console.log('=> 확인됨: 빈 문자열(\'\')은 TIMESTAMPTZ 타입에 저장할 수 없습니다. null을 사용해야 합니다.');
        }
    } else {
        console.log('[SUCCESS] Project inserted successfully despite empty dates? (Unexpected if DB is strict)');
    }
}

testCreateProject();
