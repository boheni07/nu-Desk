
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- USERS ---');
    const { data: users } = await supabase.from('users').select('*');
    console.table(users.map(u => ({ id: u.id, login_id: u.login_id, role: u.role, dept: u.department })));

    console.log('--- PROJECTS ---');
    const { data: projects } = await supabase.from('projects').select('*');
    console.table(projects.map(p => ({ id: p.id, name: p.name, support: p.support_staff_ids, customers: p.customer_contact_ids })));

    console.log('--- TICKETS ---');
    const { data: tickets } = await supabase.from('tickets').select('*');
    console.table(tickets.map(t => ({ id: t.id, title: t.title, project: t.project_id, status: t.status })));
}

checkData();
