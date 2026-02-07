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
