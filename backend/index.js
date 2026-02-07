const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query } = require('./config/db');
const initDb = require('./utils/initDb');
require('./utils/cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
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

app.use('/api/gallery', require('./routes/gallery'));

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'DBU Gibi Gubae API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request payload too large.' });
    }
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

// Start Server (Skip if on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        try {
            await initDb();
            const { rows } = await query('SELECT NOW()');
            console.log('Database connected successfully at:', rows[0].now);
        } catch (err) {
            console.error('Database connection failed:', err.message);
        }
    });
} else {
    // On Vercel, log connection info once during cold start
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`Backend initialized on Vercel. Database Target: ${maskedUrl}`);
}

module.exports = app;
