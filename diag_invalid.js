
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    const { data: tickets } = await supabase.from('tickets').select('id, title, due_date, customer_name, project_id');
    if (!tickets) {
        console.log('No tickets found or error.');
        return;
    }

    console.log('--- INVALID TICKETS ---');
    const invalid = tickets.filter(t => !t.due_date || !t.customer_name || !t.project_id);
    console.log(JSON.stringify(invalid, null, 2));

    console.log('--- TOTAL TICKETS ---');
    console.log(tickets.length);
}

checkData();
