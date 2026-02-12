
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    const { data: users } = await supabase.from('users').select('*');
    const { data: projects } = await supabase.from('projects').select('*');
    const { data: tickets } = await supabase.from('tickets').select('*');

    console.log(JSON.stringify({
        users: users?.map(u => ({ id: u.id, login_id: u.login_id, role: u.role })),
        projects: projects?.map(p => ({ id: p.id, name: p.name, support: p.support_staff_ids, customers: p.customer_contact_ids })),
        tickets: tickets?.map(t => ({ id: t.id, title: t.title, project_id: t.project_id, status: t.status }))
    }, null, 2));
}

checkData();
