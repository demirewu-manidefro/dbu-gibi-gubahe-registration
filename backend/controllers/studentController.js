const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getStudents = async (req, res) => {
    try {
        let sql = `
            SELECT 
                s.*, 
                s.full_name as name, 
                s.service_section as section,
                u.username 
            FROM students s
            LEFT JOIN users u ON s.user_id = u.id
        `;
        const params = [];

        // If admin, they can only see their own section
        if (req.user.role === 'admin') {
            sql += ' WHERE s.service_section = $1';
            params.push(req.user.section);
        }

        sql += ' ORDER BY s.created_at DESC';
        const { rows } = await query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.registerStudent = async (req, res) => {
    const studentData = req.body;
    const studentId = studentData.studentId || studentData.student_id || studentData.id || studentData.username;
    const fullName = studentData.fullName || studentData.full_name || 'Unknown Student';

    try {
        // 1. Determine if we are updating an existing student based on user_id or studentId
        let existingProfile = [];

        if (req.user && req.user.role === 'student') {
            const { rows } = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
            existingProfile = rows;
        } else {
            const { rows } = await query('SELECT id FROM students WHERE id = $1', [studentId]);
            existingProfile = rows;
        }

        // 2. Ensure a user exists in the 'users' table
        const { rows: userRows } = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [studentId.trim()]);

        if (userRows.length === 0 && !req.user) {
            const defaultPassword = await bcrypt.hash('password123', 10);
            await query(
                'INSERT INTO users (username, password, name, role, status) VALUES ($1, $2, $3, $4, $5)',
                [studentId.trim(), defaultPassword, fullName, 'student', 'active']
            );
        }

        const columns = [
            'id', 'full_name', 'gender', 'age', 'birth_date', 'baptismal_name', 'priesthood_rank',
            'mother_tongue', 'other_languages', 'region', 'zone', 'woreda', 'kebele', 'phone',
            'gibi_name', 'center_and_woreda', 'parish_church', 'emergency_name', 'emergency_phone',
            'department', 'batch', 'school_info', 'is_graduated', 'graduation_year', 'service_section', 'trainee_type',
            'teacher_training', 'leadership_training', 'other_trainings', 'additional_info',
            'filled_by', 'status', 'photo_url', 'user_id'
        ];

        let ownerUserId = req.user ? req.user.id : null;

        if (!ownerUserId) {
            const { rows: userSearch } = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [studentId.trim()]);
            if (userSearch[0]) ownerUserId = userSearch[0].id;
        }

        const values = [
            studentId,
            fullName,
            studentData.gender,
            studentData.age,
            studentData.birthDate,
            studentData.baptismalName,
            studentData.priesthoodRank,
            studentData.motherTongue,
            studentData.otherLanguages,
            studentData.region,
            studentData.zone,
            studentData.woreda,
            studentData.kebele,
            studentData.phone,
            studentData.gibiName,
            studentData.centerAndWoreda || studentData.center_and_woreda,
            studentData.parishChurch || studentData.parish_church,
            studentData.emergencyName || studentData.emergency_name,
            studentData.emergencyPhone || studentData.emergency_phone,
            studentData.department || studentData.dept,
            studentData.batch || studentData.year,
            studentData.schoolInfo ? JSON.stringify(studentData.schoolInfo) : null,
            studentData.isGraduated ?? studentData.is_graduated ?? false,
            studentData.graduationYear || studentData.graduation_year,
            studentData.serviceSection || studentData.service_section,
            studentData.traineeType || studentData.trainee_type,
            studentData.teacherTraining ? JSON.stringify(studentData.teacherTraining) : null,
            studentData.leadershipTraining ? JSON.stringify(studentData.leadershipTraining) : null,
            studentData.otherTrainings || studentData.other_trainings,
            studentData.additionalInfo || studentData.additional_info,
            studentData.filledBy || studentData.filled_by || fullName,
            studentData.status || 'Pending',
            studentData.photoUrl || studentData.photo_url,
            ownerUserId
        ];

        if (existingProfile.length === 0) {
            // Insert
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const sql = `INSERT INTO students (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);
            res.status(201).json(rows[0]);
        } else {
            // Update
            const anchorId = existingProfile[0].id;
            const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
            const sql = `UPDATE students SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
            const { rows } = await query(sql, [...values, anchorId]);
            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {

        const fields = Object.keys(updates);
        if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];

        // Special handling for JSON fields if they come as objects
        for (let i = 1; i < values.length; i++) {
            if (typeof values[i] === 'object' && values[i] !== null) {
                values[i] = JSON.stringify(values[i]);
            }
        }

        const sql = `UPDATE students SET ${setClause} WHERE id = $1 RETURNING *`;
        const { rows } = await query(sql, values);

        if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await query('DELETE FROM students WHERE id = $1', [id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.approveStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await query('SELECT service_section FROM students WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });

        const studentSection = rows[0].service_section;

        // Authorization: Admin must match section OR be Manager
        if (req.user.role === 'admin' && req.user.section !== studentSection) {
            return res.status(403).json({ message: 'You are not authorized to approve students for this section' });
        }

        await query("UPDATE students SET status = 'Student' WHERE id = $1", [id]);
        res.json({ message: 'Student approved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.declineStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await query('SELECT service_section FROM students WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });

        const studentSection = rows[0].service_section;

        // Authorization: Admin must match section OR be Manager
        if (req.user.role === 'admin' && req.user.section !== studentSection) {
            return res.status(403).json({ message: 'You are not authorized to decline students for this section' });
        }

        await query('DELETE FROM students WHERE id = $1', [id]);
        res.json({ message: 'Student registration declined' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
