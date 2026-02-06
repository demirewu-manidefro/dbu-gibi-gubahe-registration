const { query } = require('../config/db');

exports.getAttendanceHistory = async (req, res) => {
    try {
        let sql = 'SELECT * FROM attendance_history';
        const params = [];

        if (req.user.role === 'admin') {
            sql += ' WHERE section = $1';
            params.push(req.user.section);
        }

        sql += ' ORDER BY date DESC, section ASC';
        const { rows } = await query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.saveAttendanceBatch = async (req, res) => {
    const { date, records } = req.body; // records: [{ section, present, absent, excused, total, percentage }]

    try {
        const results = [];
        for (const record of records) {
            const { section, present, absent, excused, total, percentage } = record;

            // Upsert: Insert or Update if date and section match
            const sql = `
                INSERT INTO attendance_history (date, section, present, absent, excused, total, percentage)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (date, section)
                DO UPDATE SET
                    present = EXCLUDED.present,
                    absent = EXCLUDED.absent,
                    excused = EXCLUDED.excused,
                    total = EXCLUDED.total,
                    percentage = EXCLUDED.percentage
                RETURNING *
            `;
            const values = [date, section, present, absent, excused, total, percentage];
            const { rows } = await query(sql, values);
            results.push(rows[0]);
        }

        res.status(200).json(results);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAnalyticsStats = async (req, res) => {
    try {

        const { rows: stats } = await query(`
            SELECT 
                section,
                AVG(percentage) as average_attendance,
                SUM(total) as total_student_records
            FROM attendance_history
            GROUP BY section
        `);

        const { rows: totals } = await query(`
            SELECT 
                COUNT(DISTINCT date) as total_sessions,
                AVG(percentage) as overall_average
            FROM attendance_history
        `);

        res.json({
            sectionStats: stats,
            summary: totals[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
