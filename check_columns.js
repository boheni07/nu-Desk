
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    console.log('--- Checking users table columns ---');
    // Fetch one row (if any) or just try to select everything to see the keys
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.log('Error selecting users:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).join(', '));
    } else {
        console.log('Table is empty. Cannot determine columns via select *.');
        // Try to insert a row with minimal fields and see what we get
        console.log('Trying to insert a minimal user to see if it even works...');
        const { error: minError } = await supabase.from('users').insert({
            id: 'min-test',
            login_id: 'min-test',
            password: 'pw',
            name: 'Min',
            role: 'ADMIN'
        });
        if (minError) {
            console.log('Minimal Insert Error:', minError.message);
        } else {
            console.log('Minimal Insert Success!');
            // Now we can check columns
            const { data: minData } = await supabase.from('users').select('*').eq('id', 'min-test');
            if (minData) console.log('Columns after min-insert:', Object.keys(minData[0]).join(', '));
            await supabase.from('users').delete().eq('id', 'min-test');
        }
    }
}

checkColumns();
