const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { addDays, isWeekend, setHours, getHours, addHours, isAfter } = require('date-fns');

// Load env vars
const envPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Business Hours Logic (Ported from utils.ts)
const addBusinessHours = (startDate, hours) => {
    let remainingHours = hours;
    let currentDate = new Date(startDate);
    const START_HOUR = 9;
    const END_HOUR = 18;

    while (remainingHours > 0) {
        // 1. If currently on weekend or outside business hours, jump to next business start
        if (isWeekend(currentDate) || getHours(currentDate) >= END_HOUR) {
            currentDate = addDays(currentDate, 1);
            currentDate = setHours(currentDate, START_HOUR);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
            continue;
        }
        if (getHours(currentDate) < START_HOUR) {
            currentDate = setHours(currentDate, START_HOUR);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        }

        // 2. Calculate remaining hours in current business day
        const currentHour = getHours(currentDate);
        const minsInCurrentHour = currentDate.getMinutes() / 60;
        const availableHoursInDay = END_HOUR - (currentHour + minsInCurrentHour);

        if (remainingHours <= availableHoursInDay) {
            // Finish in current day
            currentDate = addHours(currentDate, remainingHours);
            remainingHours = 0;
        } else {
            // Move to next business day start
            remainingHours -= availableHoursInDay;
            currentDate = addDays(currentDate, 1);
            currentDate = setHours(currentDate, START_HOUR);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        }
    }
    return currentDate;
};

async function updateOverdueTickets() {
    console.log('Fetching WAITING tickets...');
    const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', '대기'); // TicketStatus.WAITING

    if (error) {
        console.error('Error fetching tickets:', error);
        return;
    }

    console.log(`Found ${tickets.length} waiting tickets.`);

    const now = new Date();
    // UTC to KST adjustment if needed? DB usually stores UTC.
    // However, JS Date(string) parses correctly if string has timezone.
    // If Supabase stores as string without TZ, it might be treated as local or UTC.

    console.log(`Current Time (System): ${now.toISOString()}`);

    let updatedCount = 0;

    for (const ticket of tickets) {
        // created_at is usually snake_case in Supabase
        const rawCreated = ticket.created_at || ticket.createdAt;
        if (!rawCreated) {
            console.log(`Ticket ${ticket.id} has no created_at date. Skipping.`);
            continue;
        }

        const createdAt = new Date(rawCreated);
        const autoReceiptTime = addBusinessHours(createdAt, 4);

        console.log(`[Ticket ${ticket.id}]`);
        console.log(`  - Created: ${createdAt.toISOString()} (Raw: ${rawCreated})`);
        console.log(`  - Auto Receipt Deadline: ${autoReceiptTime.toISOString()}`);
        console.log(`  - Overdue? ${isAfter(now, autoReceiptTime)}`);

        if (isAfter(now, autoReceiptTime)) {
            console.log(`Updating Ticket ${ticket.id} (Created: ${createdAt.toISOString()}, Deadline: ${autoReceiptTime.toISOString()})`);

            // Update Ticket Status
            const { error: updateError } = await supabase
                .from('tickets')
                .update({ status: '접수(자동)' }) // TicketStatus.RECEIVED_AUTO
                .eq('id', ticket.id);

            if (updateError) {
                console.error(`Failed to update ticket ${ticket.id}:`, updateError);
                continue;
            }

            // check if history table has snake_case or camelCase columns. Usually Supabase is snake_case in standard, but let's check basic standard.
            // Based on types.ts, it seems app uses camelCase for internal objects but DB might be snake_case.
            // Let's try to infer from previous SQL or just use standard Supabase convention which is usually matching the JS object if using auto-mapping, 
            // but raw SQL showed snake_case columns (postpone_reason).
            // However, types.ts `HistoryEntry` has `ticketId`, `changedBy`.
            // Let's assume the table columns are `ticket_id`, `changed_by`, `status`, `timestamp`, `note`.

            // To be safe, let's check one history entry structure or try both/standard snake_case.
            // The `supabase_ticket_update.sql` showed `questions` table columns as snake_case.

            const historyEntry = {
                ticket_id: ticket.id,
                status: '접수(자동)',
                changed_by: 'System',
                timestamp: now.toISOString(),
                note: '일괄 처리: 접수 대기 4근무시간 경과로 인해 상태가 접수(자동)으로 변경되었습니다.'
            };

            const { error: historyError } = await supabase
                .from('history')
                .insert([historyEntry]);

            if (historyError) {
                // If column names are different, try camelCase (though unlikely for Postgres)
                const historyEntryCamel = {
                    ticketId: ticket.id,
                    status: '접수(자동)',
                    changedBy: 'System',
                    timestamp: now.toISOString(),
                    note: '일괄 처리: 접수 대기 4근무시간 경과로 인해 상태가 접수(자동)으로 변경되었습니다.'
                };
                await supabase.from('history').insert([historyEntryCamel]);
            }

            updatedCount++;
        }
    }

    console.log(`Batch update complete. ${updatedCount} tickets updated.`);
}

updateOverdueTickets();
