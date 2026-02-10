
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const initialUsers = [
    { id: 'u1', loginId: 'admin1', password: 'password123', name: '홍길동 관리자', role: 'ADMIN', status: 'ACTIVE', mobile: '010-1111-2222', email: 'admin@nu.com' },
    { id: 'u2', loginId: 'support1', password: 'password123', name: '이지원 지원팀장', role: 'SUPPORT_LEAD', status: 'ACTIVE', department: '기술지원1팀', mobile: '010-3333-4444', email: 'support1@nu.com' },
    { id: 'u3', loginId: 'support2', password: 'password123', name: '박기술 엔지니어', role: 'SUPPORT_STAFF', status: 'ACTIVE', department: '기술지원1팀', mobile: '010-7777-8888', email: 'support2@nu.com' },
    { id: 'u4', loginId: 'customer1', password: 'password123', name: '김고객 과장', role: 'CUSTOMER', status: 'ACTIVE', companyId: 'c2', phone: '02-123-4567', mobile: '010-5555-6666', email: 'customer1@mirai.com' },
    { id: 'u5', loginId: 'customer2', password: 'password123', name: '최협력 대리', role: 'CUSTOMER', status: 'ACTIVE', companyId: 'c3', phone: '051-987-6543', mobile: '010-9999-0000', email: 'customer2@global.com' },
];

async function debug() {
    console.log('--- Debugging Batch User Save ---');
    const mapped = initialUsers.map(user => ({
        id: user.id,
        login_id: user.loginId,
        password: user.password,
        name: user.name,
        role: user.role,
        status: user.status,
        company_id: user.companyId || null,
        department: user.department || null,
        mobile: user.mobile || null,
        email: user.email || null,
        phone: user.phone || null
    }));

    const { data, error } = await supabase.from('users').upsert(mapped);
    if (error) {
        console.error('Error saving users:', JSON.stringify(error, null, 2));
    } else {
        console.log('Users saved successfully');
    }
}

debug();
