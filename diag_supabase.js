
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnostic() {
    console.log('--- Supabase Diagnostic ---');

    // 1. Try to fetch one user
    const { data: users, error: fetchError } = await supabase.from('users').select('*').limit(1);
    console.log('Fetch Users:', fetchError ? fetchError.message : `${users.length} found`);

    // 2. Try to insert a test user
    const testUser = {
        id: 'test-diag-' + Date.now(),
        login_id: 'diag-user-' + Date.now(),
        password: 'password',
        name: 'Diag User',
        role: 'ADMIN',
        status: 'ACTIVE'
    };

    console.log('Inserting Test User...');
    const { error: insertError } = await supabase.from('users').insert(testUser);
    if (insertError) {
        console.log('Insert Error:', insertError.message);
        console.log('Error Details:', JSON.stringify(insertError, null, 2));
    } else {
        console.log('Insert Success!');
        // Clean up
        await supabase.from('users').delete().eq('id', testUser.id);
    }

    // 3. Check companies to see what's in there
    const { data: companies } = await supabase.from('companies').select('id, name');
    console.log('Companies:', companies ? companies.map(c => `${c.id}:${c.name}`).join(', ') : 'None');
}

diagnostic();
