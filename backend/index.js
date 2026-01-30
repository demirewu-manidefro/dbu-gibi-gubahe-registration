const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query } = require('./config/db');
const initDb = require('./utils/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/users', require('./routes/users'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'DBU Gibi Gubae API is running' });
});

// Start Server
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    // Initialize/Update Database Schema
    await initDb();

    // Test DB connection
    try {
        await query('SELECT NOW()');
        console.log('Database connection verified successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
});
