const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

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
    console.log('DEBUG: registerStudent received data:', JSON.stringify(studentData, null, 2));

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


        let targetOwnerId = null;

        const { rows: existingUserRows } = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [studentId.trim()]);

        if (existingUserRows.length > 0) {
            targetOwnerId = existingUserRows[0].id;
        } else {
            const defaultPassword = await bcrypt.hash('password123', 10);
            const { rows: newUser } = await query(
                'INSERT INTO users (username, password, name, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [studentId.trim(), defaultPassword, fullName, 'student', 'active']
            );
            targetOwnerId = newUser[0].id;
        }
        if (req.user && req.user.role === 'student') {

            targetOwnerId = req.user.id;
        }

        const columns = [
            'id', 'full_name', 'gender', 'age', 'birth_date', 'baptismal_name', 'priesthood_rank',
            'mother_tongue', 'other_languages', 'region', 'zone', 'woreda', 'kebele', 'phone',
            'gibi_name', 'center_and_woreda', 'parish_church', 'emergency_name', 'emergency_phone',
            'department', 'batch', 'school_info', 'is_graduated', 'graduation_year', 'service_section', 'trainee_type',
            'teacher_training', 'leadership_training', 'other_trainings', 'additional_info',
            'filled_by', 'verified_by', 'status', 'photo_url', 'user_id'
        ];

        const values = [
            studentId,
            fullName,
            studentData.gender || studentData.sex,
            studentData.age ? parseInt(studentData.age) : null,
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

                let schoolObj = typeof info === 'string' ? JSON.parse(info) : { ...info };


                if (!schoolObj.gpa && studentData.gpa) schoolObj.gpa = studentData.gpa;
                if (!schoolObj.participation && studentData.participation) schoolObj.participation = studentData.participation;
                if (!schoolObj.specialEducation && studentData.specialEducation) schoolObj.specialEducation = studentData.specialEducation;
                if (!schoolObj.specialPlace && studentData.specialPlace) schoolObj.specialPlace = studentData.specialPlace;
                if (!schoolObj.attendance && studentData.attendance) schoolObj.attendance = studentData.attendance;
                if (!schoolObj.educationYearly && studentData.educationYearly) schoolObj.educationYearly = studentData.educationYearly;
                if (!schoolObj.abinetEducation && studentData.abinetEducation) schoolObj.abinetEducation = studentData.abinetEducation;
                if (!schoolObj.specialNeed && studentData.specialNeed) schoolObj.specialNeed = studentData.specialNeed;
                if (!schoolObj.cumulativeGPA && studentData.cumulativeGPA) schoolObj.cumulativeGPA = studentData.cumulativeGPA;
                if (!schoolObj.membershipYear && studentData.membershipYear) schoolObj.membershipYear = studentData.membershipYear;

                return JSON.stringify(schoolObj);
            })(),
            studentData.is_graduated ?? studentData.isGraduated ?? false,
            (studentData.graduation_year || studentData.graduationYear) ? parseInt(studentData.graduation_year || studentData.graduationYear) : null,
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
            targetOwnerId
        ];

        if (existingProfile.length === 0) {
            // Insert
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            const sql = `INSERT INTO students (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            // Notification logic removed as per user request

            // Sync photo to users table (Using targetOwnerId)
            if (studentData.photo_url || studentData.photoUrl) {
                await query('UPDATE users SET photo_url = $1 WHERE id = $2', [studentData.photo_url || studentData.photoUrl, targetOwnerId]);
            }

            res.status(201).json(rows[0]);
        } else {
            // Update
            const anchorId = existingProfile[0].id;
            const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
            const sql = `UPDATE students SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
            const { rows } = await query(sql, [...values, anchorId]);
            // Sync photo to users table (Using targetOwnerId)
            if (studentData.photo_url || studentData.photoUrl) {
                await query('UPDATE users SET photo_url = $1 WHERE id = $2', [studentData.photo_url || studentData.photoUrl, targetOwnerId]);
            }

            res.json(rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message, stack: String(err) });
    }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {


        const processedUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            let k = key;
            let v = value;
            if (k === 'birthYear' || k === 'birthDate') k = 'birth_date';
            if (k === 'fullName') k = 'full_name';
            if (k === 'gender') k = 'gender';
            if (k === 'traineeType') k = 'trainee_type';
            if (k === 'studentId') k = 'id';
            if (k === 'photoUrl') k = 'photo_url';
            if (k === 'schoolInfo') k = 'school_info';
            if (k === 'serviceSection' || k === 'section') k = 'service_section';

            if (k === 'birth_date' && v && /^\d{4}$/.test(String(v))) {
                v = `${v}-01-01`;
            }

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

        const student = rows[0];
        const target = (student.service_section || 'all').trim();
        await createNotification(
            'student_updated',
            `Student updated: ${student.full_name} (${student.id})`,
            target
        );

        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {

        const { rows: students } = await query('SELECT full_name, service_section FROM students WHERE id = $1', [id]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });

        const student = students[0];

        const { rowCount } = await query('DELETE FROM students WHERE id = $1', [id]);
        await createNotification(
            'student_deleted',
            `Student removed: ${student.full_name} (${id})`,
            (student.service_section || 'all').trim()
        );

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


        let authorized = false;
        if (req.user.role === 'manager') {
            authorized = true;
        } else if (req.user.role === 'admin') {

            if (!studentSection) {
                authorized = true;
            } else {
                const s1 = String(studentSection).trim().toLowerCase();
                const s2 = String(req.user.section).trim().toLowerCase();
                if (s1 === s2) authorized = true;
            }
        }

        if (!authorized) {
            return res.status(403).json({ message: 'You are not authorized to approve students for this section' });
        }
        await query(
            "UPDATE students SET status = 'Student', verified_by = $1, service_section = COALESCE(service_section, $3) WHERE id = $2",
            [req.user.name, id, req.user.section]
        );
        await createNotification(
            'approval',
            `Student Approved: ${rows[0].id} by ${req.user.name}`,
            'manager'
        );

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

        let authorized = false;
        if (req.user.role === 'manager') {
            authorized = true;
        } else if (req.user.role === 'admin') {
            if (!studentSection) {
                authorized = true;
            } else {
                const s1 = String(studentSection).trim().toLowerCase();
                const s2 = String(req.user.section).trim().toLowerCase();
                if (s1 === s2) authorized = true;
            }
        }

        if (!authorized) {
            return res.status(403).json({ message: 'You are not authorized to decline students for this section' });
        }

        // Fetch student name for notification
        const { rows: studentInfo } = await query('SELECT full_name FROM students WHERE id = $1', [id]);
        const studentName = studentInfo[0]?.full_name || id;

        await query('DELETE FROM students WHERE id = $1', [id]);

        // Notify Manager
        await createNotification(
            'decline',
            `Student registration declined: ${studentName} (${id}) by ${req.user.name}`,
            'manager'
        );

        res.json({ message: 'Student registration declined' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.importStudents = async (req, res) => {
    const students = req.body;
    if (!Array.isArray(students)) {
        return res.status(400).json({ message: 'Input must be an array of students' });
    }

    const results = {
        success: 0,
        failed: 0,
        errors: []
    };

    try {
        for (const studentData of students) {
            try {
                const studentId = studentData.studentId || studentData.student_id || studentData.id;
                if (!studentId) {
                    results.failed++;
                    results.errors.push(`Missing ID for student: ${studentData.name || 'Unknown'}`);
                    continue;
                }

                const fullName = studentData.fullName || studentData.full_name || studentData.name || 'Unknown Student';
                const { rows: userRows } = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [studentId.trim()]);
                let userId = null;

                if (userRows.length === 0) {
                    const defaultPassword = await bcrypt.hash('password123', 10);
                    const { rows: newUser } = await query(
                        'INSERT INTO users (username, password, name, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                        [studentId.trim(), defaultPassword, fullName, 'student', 'active']
                    );
                    userId = newUser[0].id;
                } else {
                    userId = userRows[0].id;
                }

                const schoolInfo = {
                    cumulativeGPA: studentData.cumulativeGPA,
                    gpa: studentData.gpa,
                    participation: studentData.participation,
                    specialEducation: studentData.specialEducation,
                    specialPlace: studentData.specialPlace,
                    attendance: studentData.attendance,
                    educationYearly: studentData.educationYearly,
                    abinetEducation: studentData.abinetEducation,
                    specialNeed: studentData.specialNeed
                };

                const columns = [
                    'id', 'full_name', 'gender', 'age', 'birth_date', 'baptismal_name', 'priesthood_rank',
                    'mother_tongue', 'other_languages', 'region', 'zone', 'woreda', 'kebele', 'phone',
                    'gibi_name', 'center_and_woreda', 'parish_church', 'emergency_name', 'emergency_phone',
                    'department', 'batch', 'service_section', 'school_info',
                    'filled_by', 'verified_by', 'status', 'user_id'
                ];

                const values = [
                    studentId,
                    fullName,
                    studentData.sex || studentData.gender,
                    studentData.age ? parseInt(studentData.age) : null,
                    studentData.birthYear ? `${studentData.birthYear}-01-01` : null,
                    studentData.baptismalName,
                    studentData.priesthoodRank,
                    studentData.motherTongue,
                    null,
                    studentData.region,
                    studentData.zone,
                    studentData.woreda,
                    studentData.kebele,
                    studentData.phone,
                    studentData.gibiName,
                    studentData.centerAndWoredaCenter,
                    studentData.parishChurch,
                    studentData.emergencyName,
                    studentData.emergencyPhone,
                    studentData.dept || studentData.department,
                    studentData.year || studentData.batch,
                    studentData.section || studentData.serviceSection,
                    JSON.stringify(schoolInfo),
                    studentData.filledBy || 'Import',
                    studentData.verifiedBy,
                    studentData.status || 'Student',
                    userId
                ];

                const sql = `
                    INSERT INTO students (${columns.join(', ')})
                    VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
                    ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    gender = EXCLUDED.gender,
                    department = EXCLUDED.department,
                    batch = EXCLUDED.batch,
                    service_section = EXCLUDED.service_section,
                    status = EXCLUDED.status
                    RETURNING id;
                `;

                await query(sql, values);
                results.success++;

            } catch (innerErr) {
                console.error(`Failed to import student ${studentData.id}:`, innerErr.message);
                results.failed++;
                results.errors.push(`ID ${studentData.id}: ${innerErr.message}`);
            }
        }

        res.json({ message: 'Import completed', results });

    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).send('Server Error during bulk import');
    }
};
