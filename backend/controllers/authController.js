const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
require('dotenv').config();

exports.signup = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const { rows: existing } = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in 'users' table
        const { rows: newUser } = await query(
            'INSERT INTO users (username, password, name, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role',
            [username.trim(), hashedPassword, 'New Student', 'student', 'active']
        );

        // Create placeholder in 'students' table
        // We use username as ID temporarily, it will be updated when they fill the registration form
        await query(
            'INSERT INTO students (id, user_id, full_name, status) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
            [username.trim(), newUser[0].id, 'N/A', 'Pending']
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ message: 'Server Error', details: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const { rows } = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username.trim()]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.status === 'blocked') {
            return res.status(403).json({ message: 'This account is blocked. Please contact the manager.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Fetch additional profile data if student
        let profileData = {};
        if (user.role === 'student') {
            const { rows: studentRows } = await query('SELECT full_name as name, service_section as section, id as student_id FROM students WHERE user_id = $1', [user.id]);
            if (studentRows[0]) {
                profileData = studentRows[0];
            }
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                name: profileData.name || user.name,
                section: user.section || profileData.section
            }
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        ...payload.user
                    }
                });
            }
        );

        // Update last activity
        await query('UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMe = async (req, res) => {
    try {
        const { rows } = await query('SELECT id, username, name, role, section, status FROM users WHERE id = $1', [req.user.id]);
        const user = rows[0];

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'student') {
            const { rows: studentRows } = await query('SELECT full_name as name, service_section as section, id as student_id FROM students WHERE user_id = $1', [user.id]);
            if (studentRows[0]) {
                return res.json({ ...user, ...studentRows[0] });
            }
        }

        return res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
