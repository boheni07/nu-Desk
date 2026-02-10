
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpsert(tableName, data) {
    console.log(`\n--- Testing ${tableName} ---`);
    const { error } = await supabase.from(tableName).upsert(data);
    if (error) {
        console.error(`FAILED: ${tableName} - ${error.message} (${error.code})`);
        if (error.details) console.error(`Details: ${error.details}`);
        if (error.hint) console.error(`Hint: ${error.hint}`);
    } else {
        console.log(`SUCCESS: ${tableName}`);
    }
}

async function run() {
    const now = new Date().toISOString();

    await testUpsert('companies', {
        id: 't-comp', name: 'Test', representative: 'Rep', industry: 'Ind', address: 'Addr', remarks: 'Rem', status: 'ACTIVE', phone: '010', email: 'test@test.com'
    });

    await testUpsert('users', {
        id: 't-user', login_id: 't-login', password: 'p', name: 'n', role: 'ADMIN', status: 'ACTIVE', company_id: null, department: 'd', mobile: 'm', email: 'e', phone: 'p'
    });

    await testUpsert('projects', {
        id: 't-proj', name: 'n', client_id: 't-comp', description: 'd', start_date: now, end_date: now, status: 'ACTIVE', customer_contact_ids: [], support_staff_ids: []
    });

    await testUpsert('tickets', {
        id: 't-tick', title: 't', description: 'd', status: '대기', customer_id: 't-user', customer_name: 'n', project_id: 't-proj', support_id: 't-user', support_name: 'n', plan: 'p', expected_completion_date: now, satisfaction: 5, completion_feedback: 'f', created_at: now, due_date: now, initial_due_date: now, shortened_due_reason: 'r', postpone_reason: 'r', postpone_date: now, rejection_reason: 'r', attachments: [], plan_attachments: [], intake_method: 'PHONE', request_date: now, expected_completion_delay_reason: 'r'
    });

    await testUpsert('comments', {
        id: 't-comm', ticket_id: 't-tick', author_id: 't-user', author_name: 'n', content: 'c', timestamp: now
    });

    await testUpsert('history', {
        id: 't-hist', ticket_id: 't-tick', status: '대기', changed_by: 'n', timestamp: now, note: 'n'
    });

    await testUpsert('operational_info', {
        project_id: 't-proj', hardware: [], software: [], access: [], other_notes: 'n', updated_at: now
    });

    await testUpsert('organization_info', {
        id: 'current', name_ko: 'n', name_en: 'n', representative: 'n', biz_number: 'n', biz_type: 'n', biz_category: 'n', zip_code: 'n', address: 'n', phone: 'n', email: 'n', support_team_1: 'n', support_team_2: 'n', support_team_3: 'n', remarks: 'n', updated_at: now
    });

    // Clean up
    console.log('\n--- Cleaning up ---');
    await supabase.from('history').delete().eq('id', 't-hist');
    await supabase.from('comments').delete().eq('id', 't-comm');
    await supabase.from('tickets').delete().eq('id', 't-tick');
    await supabase.from('operational_info').delete().eq('project_id', 't-proj');
    await supabase.from('projects').delete().eq('id', 't-proj');
    await supabase.from('users').delete().eq('id', 't-user');
    await supabase.from('companies').delete().eq('id', 't-comp');
}

run();
