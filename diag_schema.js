
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    const { data: tickets, error } = await supabase.from('tickets').select('*').limit(1);
    if (error) {
        console.error('Error fetching ticket:', error);
        return;
    }
    if (tickets && tickets.length > 0) {
        console.log('Columns in tickets table:', Object.keys(tickets[0]));
    } else {
        console.log('No tickets found.');
    }
}

checkSchema();
