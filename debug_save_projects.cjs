
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const initialProjects = [
    { id: 'p1', name: 'ERP 시스템 고도화', clientId: 'c2', customerContactIds: ['u4'], supportStaffIds: ['u2', 'u3'], description: '기존 ERP 성능 향상 및 모바일 대응', startDate: '2024-01-01', endDate: '2024-12-31', status: 'ACTIVE' },
    { id: 'p2', name: '클라우드 마이그레이션', clientId: 'c3', customerContactIds: ['u5'], supportStaffIds: ['u3'], description: '온프레미스 서버의 AWS 전환', startDate: '2024-03-01', endDate: '2024-09-30', status: 'ACTIVE' },
];

async function debug() {
    console.log('--- Debugging Batch Project Save ---');
    const mapped = initialProjects.map(project => ({
        id: project.id,
        name: project.name,
        client_id: project.clientId,
        description: project.description,
        start_date: project.startDate,
        end_date: project.endDate,
        status: project.status,
        customer_contact_ids: project.customerContactIds,
        support_staff_ids: project.supportStaffIds
    }));

    const { data, error } = await supabase.from('projects').upsert(mapped);
    if (error) {
        console.error('Error saving projects:', JSON.stringify(error, null, 2));
    } else {
        console.log('Projects saved successfully');
    }
}

debug();
