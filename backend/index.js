const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query } = require('./config/db');
const initDb = require('./utils/initDb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
// Increase JSON limit for base64 images (default is 100kb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/gallery', require('./routes/gallery'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'DBU Gibi Gubae API is running' });
});

// Global error handler - ensures all errors return JSON, not HTML
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    // Handle payload too large error
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request payload too large. Please use a smaller image.' });
    }

    // Handle JSON parse errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
    }

    // Default error response
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
