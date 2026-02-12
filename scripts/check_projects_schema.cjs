const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log('--- Checking Projects Table Schema ---');

    // projects 테이블에서 데이터 1건을 조회하여 컬럼 구성을 확인
    const { data, error } = await supabase.from('projects').select('*').limit(1);

    if (error) {
        console.error('[ERROR] Failed to select from projects:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('Successfully retrieved 1 project. Columns found:');
        console.log(Object.keys(data[0]));
    } else {
        console.log('No data in projects table, trying to catch column info through error by inserting invalid column...');
        const { error: insertError } = await supabase.from('projects').insert({ id: 'dummy', invalid_column_test: 'test' });
        console.log('Insert error message (might contain schema info):', insertError?.message);
    }

    // RPC가 활성화되어 있다면 테이블 정보 조회 가능
    console.log('\n--- Checking if remarks column exists in project mapping ---');
    const testData = {
        id: 'diag_' + Date.now(),
        name: 'Diag Test',
        client_id: null,
        description: 'Test',
        status: '활성'
    };

    // remarks를 포함한 삽입 시도
    const { error: remarksError } = await supabase.from('projects').insert({ ...testData, remarks: 'test' });
    if (remarksError && remarksError.message.includes('column "remarks" of relation "projects" does not exist')) {
        console.error('=> CONFIRMED: "remarks" column is MISSING in Supabase table.');
    } else if (remarksError) {
        console.log('Insert with remarks failed with other error:', remarksError.message);
    } else {
        console.log('Insert with remarks SUCCEEDED. Column exists.');
    }
}

checkSchema();
