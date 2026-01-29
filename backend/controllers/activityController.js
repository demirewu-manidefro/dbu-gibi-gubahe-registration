const { query } = require('../config/db');

exports.getLogs = async (req, res) => {
    try {
        let sql = 'SELECT id, type, admin_name as admin, details, time, status FROM activity_log';
        const params = [];

        // If admin, show logs related to their section or their own actions
        if (req.user.role === 'admin') {
            sql += ' WHERE admin_name = $1 OR (details->>\'section\') = $2';
            params.push(req.user.name, req.user.section);
        }

        sql += ' ORDER BY time DESC LIMIT 50';
        const { rows } = await query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addLog = async (req, res) => {
    const { type, details } = req.body;
    try {
        const sql = 'INSERT INTO activity_log (type, admin_name, details) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await query(sql, [type, req.user.name, JSON.stringify(details)]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
