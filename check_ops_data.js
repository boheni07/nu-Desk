
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOps() {
    console.log('Fetching operational_info...');
    const { data, error } = await supabase.from('operational_info').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Data found:', data.length);
    if (data.length > 0) {
        console.log('First record sample:', JSON.stringify(data[0], null, 2));
    }

    console.log('\nFetching projects sample...');
    const { data: projects, error: pError } = await supabase.from('projects').select('id, name').limit(5);
    if (pError) {
        console.error('Project Error:', pError);
    } else {
        console.log('Projects available:', projects.map(p => `${p.id} (${p.name})`));
    }
}

checkOps();
