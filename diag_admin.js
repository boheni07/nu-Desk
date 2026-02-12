
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
    const { data: admin } = await supabase.from('users').select('*').eq('login_id', 'admin').single();
    console.log('Admin User:', admin ? { id: admin.id, role: admin.role, name: admin.name } : 'Not found');

    const { data: projects } = await supabase.from('projects').select('id, name, support_staff_ids');
    console.log('Projects and Staff:', JSON.stringify(projects, null, 2));

    const { data: tickets } = await supabase.from('tickets').select('id, project_id');
    console.log('Ticket Project IDs:', tickets?.map(t => t.project_id));
}

checkUsers();
