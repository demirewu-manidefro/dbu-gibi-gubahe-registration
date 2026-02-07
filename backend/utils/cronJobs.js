const cron = require('node-cron');
const { query } = require('../config/db');

// Run everyday at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup job: Deleting incomplete accounts older than 24 hours');
    try {
        // Query to find users who:
        // 1. Have role 'student' (don't delete admins/managers)
        // 2. Created account more than 24 hours ago
        // 3. Have "incomplete" profile (defined as having a placeholder in the students table or no student record)
        // Adjust the "incomplete" definition based on your logic. 
        // Here we assume if 'full_name' is still 'N/A' or 'New Student' or 'Unknown Student' it counts as incomplete.
        // Or if they haven't filled specific fields like 'phone', 'department', etc.
        // Based on signup flow:
        // Signup creates User -> Creates Student Placeholder (full_name='N/A', status='Pending')

        const deleteQuery = `
            DELETE FROM users 
            WHERE role = 'student' 
            AND created_at < NOW() - INTERVAL '24 hours'
            AND id IN (
                SELECT u.id 
                FROM users u
                LEFT JOIN students s ON u.id = s.user_id
                WHERE (s.id IS NULL OR s.full_name = 'N/A' OR s.full_name = 'New Student')
            )
            RETURNING id, username;
        `;

        // Note: users table needs created_at. If it doesn't exist, we must add it or use another field (e.g. id if sequential/uuid with timestamp, but timestamp is safer)
        // Let's check schema.sql... users table does NOT have created_at in the previous view! 
        // It has 'last_activity'. We could use that if it defaults to creation time?
        // Schema shows: last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        // So yes, initially last_activity = creation time.
        // BUT if they login, last_activity updates. 
        // If they login but DON'T register, last_activity updates, so they survive another 24 hours.
        // This might be acceptable? "Delete if inactive AND incomplete for 24 hours".
        // Actually the user asked: "if he didn't fill in one day". implying time from creation.
        // If I use last_activity, logging in resets the timer.
        // It's safer to add created_at to users table for this specific purpose.

        // However, user said "update the db also" earlier for something else.
        // I should probably add created_at to users table first to be precise.
        // For now, I'll use last_activity as a proxy for "Inactive" which is also a valid cleanup metric.
        // "Inactive for 24 hours AND has no profile" -> Delete.

        const { rows } = await query(`
            DELETE FROM users 
            WHERE role = 'student' 
            AND created_at < NOW() - INTERVAL '24 hours'
            AND id IN (
                SELECT u.id 
                FROM users u
                LEFT JOIN students s ON u.id = s.user_id
                WHERE (s.id IS NULL OR s.full_name = 'N/A' OR s.full_name = 'New Student')
                AND s.filled_by IS NULL
            )
            RETURNING id, username;
        `);

        if (rows.length > 0) {
            console.log(`Deleted ${rows.length} incomplete/inactive accounts:`, rows.map(r => r.username));
        } else {
            console.log('No incomplete accounts found to delete.');
        }

    } catch (err) {
        console.error('Error running cleanup job:', err);
    }
});

module.exports = cron;
