const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf8');
        await query(schema);

        // Ensure students table is updated
        await query(`
            ALTER TABLE students DROP COLUMN IF EXISTS username;
            ALTER TABLE students DROP COLUMN IF EXISTS password;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(100);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS batch VARCHAR(20);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(50);
            
            -- Backfill section for admins if missing (assuming username is the section name)
            UPDATE users SET section = username WHERE role = 'admin' AND section IS NULL;
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                target_section VARCHAR(50) NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                read_by JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Database schema initialized and updated');

        // Check if manager exists, if not create default
        const { rows } = await query("SELECT * FROM users WHERE username = 'manager'");
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('manager123', 10);
            await query(
                "INSERT INTO users (username, password, name, role, status) VALUES ($1, $2, $3, $4, $5)",
                ['manager', hashedPassword, 'Super Manager', 'manager', 'active']
            );
            console.log('Default manager user created');
        }

        // Create default section admins
        const sections = ['እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ', 'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ', 'መዝሙር'];
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const { rows: adminRows } = await query("SELECT * FROM users WHERE username = $1", [section]);
            if (adminRows.length === 0) {
                const hashedPassword = await bcrypt.hash(`pass${i + 1}`, 10);
                await query(
                    "INSERT INTO users (username, password, name, role, section, status) VALUES ($1, $2, $3, $4, $5, $6)",
                    [section, hashedPassword, `${section} ክፍል`, 'admin', section, 'active']
                );
                console.log(`Default admin for ${section} created`);
            }
        }

    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

if (require.main === module) {
    initDb().then(() => process.exit());
}

module.exports = initDb;
