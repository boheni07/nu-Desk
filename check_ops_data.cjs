
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Key missing in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkOps() {
    console.log('Fetching operational_info...');
    try {
        const { data, error } = await supabase.from('operational_info').select('*');
        if (error) {
            console.error('Error fetching operational_info:', error);
            return;
        }
        console.log('Data count:', data.length);
        if (data.length > 0) {
            console.log('Sample operation data:', JSON.stringify(data[0], null, 2));
        }

        console.log('\nFetching projects...');
        const { data: projects, error: pError } = await supabase.from('projects').select('id, name');
        if (pError) {
            console.error('Error fetching projects:', pError);
        } else {
            console.log('Projects count:', projects.length);
            console.log('First 5 Project IDs:', projects.slice(0, 5).map(p => `${p.id} (${p.name})`));

            if (data.length > 0) {
                const sampleProjectId = data[0].project_id;
                const match = projects.find(p => p.id === sampleProjectId);
                console.log(`\nMatching sample project_id (${sampleProjectId}):`, match ? 'FOUND' : 'NOT FOUND');
            }
        }
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkOps();
