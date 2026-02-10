
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    console.log('--- Testing fetchUsers Mapping ---');
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    const mapped = (data || []).map(u => ({
        ...u,
        loginId: u.login_id,
        companyId: u.company_id,
        department: u.department
    }));

    console.log('Sample User Object Keys:', Object.keys(mapped[0] || {}));
    console.log('Check admin1:', mapped.find(u => u.loginId === 'admin1' && u.password === 'password123') ? 'FOUND' : 'NOT FOUND');
    if (mapped[0]) {
        console.log('loginId value:', mapped[0].loginId);
        console.log('password value:', mapped[0].password);
    }
}

debug();
