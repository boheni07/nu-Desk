
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const now = new Date();
const sampleTickets = [
    { id: 'T-1001', title: '로그인 페이지 간헐적 튕김 현상', description: '특정 모바일 브라우저에서 로그인 시도 시 세션이 유지되지 않고 메인으로 돌아갑니다.', status: 'WAITING', customerId: 'u4', customerName: '김고객 과장', projectId: 'p1', createdAt: now.toISOString(), dueDate: now.toISOString(), initialDueDate: now.toISOString() },
    { id: 'T-1002', title: '신규 사용자 권한 일괄 등록 요청', description: '인사 이동으로 인한 50명의 사용자 권한을 엑셀 기반으로 등록 요청합니다.', status: 'RECEIVED', customerId: 'u5', customerName: '최협력 대리', supportId: 'u3', supportName: '박기술 엔지니어', projectId: 'p2', createdAt: now.toISOString(), dueDate: now.toISOString(), initialDueDate: now.toISOString() },
];

async function debug() {
    console.log('--- Debugging Batch Ticket Save ---');
    const mapped = sampleTickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        customer_id: ticket.customerId,
        customer_name: ticket.customerName,
        project_id: ticket.projectId,
        support_id: ticket.supportId,
        support_name: ticket.supportName,
        created_at: ticket.createdAt,
        due_date: ticket.dueDate,
        initial_due_date: ticket.initialDueDate
    }));

    const { data, error } = await supabase.from('tickets').upsert(mapped);
    if (error) {
        console.error('Error saving tickets:', JSON.stringify(error, null, 2));
    } else {
        console.log('Tickets saved successfully');
    }
}

debug();
