
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const initialCompanies = [
    { id: 'c1', name: '누테크놀로지', representative: '누대표', industry: 'IT 서비스', address: '서울시 강남구', remarks: '본사', status: '활성' },
    { id: 'c2', name: '(주)미래제조', representative: '김미래', industry: '제조업', address: '경기도 판교', remarks: '핵심 고객사', status: '활성' },
    { id: 'c3', name: '글로벌유통', representative: '이유통', industry: '유통업', address: '부산시 해운대구', remarks: '전략적 파트너', status: '활성' },
    { id: 'c4', name: '한국금융솔루션', representative: '박금융', industry: '금융업', address: '서울시 여의도', status: '활성' },
    { id: 'c5', name: '공공데이터센터', representative: '최공공', industry: '공공기관', address: '세종특별자치시', status: '활성' },
];

const initialUsers = [
    { id: 'u1', login_id: 'admin1', password: 'password123', name: '홍길동 관리자', role: 'ADMIN', status: '활성', mobile: '010-1111-2222', email: 'admin@nu.com' },
    { id: 'u2', login_id: 'support1', password: 'password123', name: '이지원 지원팀장', role: 'SUPPORT_LEAD', status: '활성', department: '기술지원1팀', mobile: '010-3333-4444', email: 'support1@nu.com' },
    { id: 'u3', login_id: 'support2', password: 'password123', name: '박기술 엔지니어', role: 'SUPPORT_STAFF', status: '활성', department: '기술지원1팀', mobile: '010-7777-8888', email: 'support2@nu.com' },
    { id: 'u4', login_id: 'customer1', password: 'password123', name: '김고객 과장', role: 'CUSTOMER', status: '활성', company_id: 'c2', phone: '02-123-4567', mobile: '010-5555-6666', email: 'customer1@mirai.com' },
    { id: 'u5', login_id: 'customer2', password: 'password123', name: '최협력 대리', role: 'CUSTOMER', status: '활성', company_id: 'c3', phone: '051-987-6543', mobile: '010-9999-0000', email: 'customer2@global.com' },
];

async function seed() {
    console.log('--- Seeding Script ---');

    console.log('Clearing Users...');
    const { error: delUserError } = await supabase.from('users').delete().neq('id', '_');
    if (delUserError) console.log('Del Users Error:', delUserError.message);

    console.log('Clearing Companies...');
    const { error: delCompError } = await supabase.from('companies').delete().neq('id', '_');
    if (delCompError) console.log('Del Companies Error:', delCompError.message);

    console.log('Saving Companies...');
    const { error: saveCompError } = await supabase.from('companies').upsert(initialCompanies);
    if (saveCompError) {
        console.log('Save Companies Error:', saveCompError.message);
    } else {
        console.log('Save Companies Success!');
    }

    console.log('Saving Users...');
    const { error: saveUserError } = await supabase.from('users').upsert(initialUsers);
    if (saveUserError) {
        console.log('Save Users Error:', saveUserError.message);
        console.log('Error Details:', JSON.stringify(saveUserError, null, 2));
    } else {
        console.log('Save Users Success!');
    }
}

seed();
