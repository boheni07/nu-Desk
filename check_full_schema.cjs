
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gczbftfbfpgomrhlsmvt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjemJmdGZiZnBnb21yaGxzbXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjM4MTUsImV4cCI6MjA4NjEzOTgxNX0.HP9xVeCg2p9Q7pVHX2i-jAuZEMNhV6CfjJMx8NR3sbY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable(tableName) {
    console.log(`\n[${tableName}]`);
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.log(`Error: ${error.message}`);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]).join(', '));
    } else {
        console.log('Table is empty.');
    }
}

async function run() {
    await checkTable('companies');
    await checkTable('users');
    await checkTable('projects');
    await checkTable('tickets');
    await checkTable('operational_info');
    await checkTable('organization_info');
}

run();
