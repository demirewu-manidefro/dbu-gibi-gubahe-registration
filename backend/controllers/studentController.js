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
            'filled_by', 'verified_by', 'status', 'photo_url', 'user_id'
        ];

        let ownerUserId = req.user ? req.user.id : null;

        if (!ownerUserId) {
            const { rows: userSearch } = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [studentId.trim()]);
            if (userSearch[0]) ownerUserId = userSearch[0].id;
        }

        const values = [
            studentId,
            fullName,
            studentData.gender || studentData.sex,
            studentData.age,
            (() => {
                const bd = studentData.birth_date || studentData.birthDate || studentData.birthYear;
                if (!bd) return null;
                if (/^\d{4}$/.test(String(bd))) return `${bd}-01-01`; // Handle year-only
                return bd;
            })(),
            studentData.baptismal_name || studentData.baptismalName,
            studentData.priesthood_rank || studentData.priesthoodRank,
            studentData.mother_tongue || studentData.motherTongue,
            studentData.other_languages || studentData.otherLanguages,
            studentData.region,
            studentData.zone,
            studentData.woreda,
            studentData.kebele,
            studentData.phone,
            studentData.gibi_name || studentData.gibiName,
            studentData.center_and_woreda || studentData.centerAndWoreda || studentData.centerAndWoredaCenter,
            studentData.parish_church || studentData.parishChurch,
            studentData.emergency_name || studentData.emergencyName,
            studentData.emergency_phone || studentData.emergencyPhone,
            studentData.department || studentData.dept,
            studentData.batch || studentData.year,
            (() => {
                const info = studentData.school_info || studentData.schoolInfo || {};
                // If it's a string, try to parse it
                let schoolObj = typeof info === 'string' ? JSON.parse(info) : { ...info };

                // Collect individual fields if not in the object
                if (!schoolObj.gpa && studentData.gpa) schoolObj.gpa = studentData.gpa;
                if (!schoolObj.participation && studentData.participation) schoolObj.participation = studentData.participation;
                if (!schoolObj.specialEducation && studentData.specialEducation) schoolObj.specialEducation = studentData.specialEducation;
                if (!schoolObj.specialPlace && studentData.specialPlace) schoolObj.specialPlace = studentData.specialPlace;
                if (!schoolObj.attendance && studentData.attendance) schoolObj.attendance = studentData.attendance;
                if (!schoolObj.educationYearly && studentData.educationYearly) schoolObj.educationYearly = studentData.educationYearly;
                if (!schoolObj.abinetEducation && studentData.abinetEducation) schoolObj.abinetEducation = studentData.abinetEducation;
                if (!schoolObj.specialNeed && studentData.specialNeed) schoolObj.specialNeed = studentData.specialNeed;
                if (!schoolObj.cumulativeGPA && studentData.cumulativeGPA) schoolObj.cumulativeGPA = studentData.cumulativeGPA;

                return JSON.stringify(schoolObj);
            })(),
            studentData.is_graduated ?? studentData.isGraduated ?? false,
            studentData.graduation_year || studentData.graduationYear,
            studentData.service_section || studentData.serviceSection || studentData.section,
            studentData.trainee_type || studentData.traineeType,
            studentData.teacher_training || studentData.teacherTraining ? JSON.stringify(studentData.teacher_training || studentData.teacherTraining) : null,
            studentData.leadership_training || studentData.leadershipTraining ? JSON.stringify(studentData.leadership_training || studentData.leadershipTraining) : null,
            studentData.other_trainings || studentData.otherTrainings,
            studentData.additional_info || studentData.additionalInfo,
            studentData.filled_by || studentData.filledBy || fullName,
            studentData.verified_by || studentData.verifiedBy,
            studentData.status || 'Pending',
            studentData.photo_url || studentData.photoUrl,
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

        // Pre-process updates for field names and values
        const processedUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            let k = key;
            let v = value;

            // Map common camelCase to snake_case if they happen to come through
            if (k === 'birthYear' || k === 'birthDate') k = 'birth_date';
            if (k === 'fullName') k = 'full_name';
            if (k === 'gender') k = 'gender';
            if (k === 'traineeType') k = 'trainee_type';
            if (k === 'studentId') k = 'id';
            if (k === 'photoUrl') k = 'photo_url';
            if (k === 'schoolInfo') k = 'school_info';
            if (k === 'serviceSection' || k === 'section') k = 'service_section';

            // Special handling for birth_date if it's just a year
            if (k === 'birth_date' && v && /^\d{4}$/.test(String(v))) {
                v = `${v}-01-01`;
            }

            // Stringify objects
            if (typeof v === 'object' && v !== null) {
                v = JSON.stringify(v);
            }

            processedUpdates[k] = v;
        }

        const fields = Object.keys(processedUpdates);
        if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
        const values = [id, ...Object.values(processedUpdates)];

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

        await query("UPDATE students SET status = 'Student', verified_by = $1 WHERE id = $2", [req.user.name, id]);
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
