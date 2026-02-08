const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const initDb = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf8');
        await query(schema);

        await query(`
            ALTER TABLE students DROP COLUMN IF EXISTS username;
            ALTER TABLE students DROP COLUMN IF EXISTS password;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(100);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS batch VARCHAR(20);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS responsibility JSONB;
            ALTER TABLE students DROP COLUMN IF EXISTS participation;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS attendance JSONB;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS education_yearly JSONB;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS gpa JSONB;
            ALTER TABLE students ADD COLUMN IF NOT EXISTS cumulative_gpa VARCHAR(20);
            ALTER TABLE students ADD COLUMN IF NOT EXISTS membership_year INT;
            -- Remove special talent from database
            ALTER TABLE students DROP COLUMN IF EXISTS special_place;
            UPDATE students SET school_info = school_info - 'specialPlace' WHERE school_info ? 'specialPlace';

            -- Migrate data from school_info to new columns if new columns are empty
            UPDATE students SET responsibility = school_info->'participation' WHERE responsibility IS NULL AND school_info->'participation' IS NOT NULL;
            UPDATE students SET gpa = school_info->'gpa' WHERE gpa IS NULL AND school_info->'gpa' IS NOT NULL;
            UPDATE students SET attendance = school_info->'attendance' WHERE attendance IS NULL AND school_info->'attendance' IS NOT NULL;
            UPDATE students SET education_yearly = school_info->'educationYearly' WHERE education_yearly IS NULL AND school_info->'educationYearly' IS NOT NULL;
            UPDATE students SET cumulative_gpa = CAST(school_info->>'cumulativeGPA' AS VARCHAR) WHERE cumulative_gpa IS NULL AND school_info->>'cumulativeGPA' IS NOT NULL;
            UPDATE students SET membership_year = CAST(school_info->>'membershipYear' AS INTEGER) WHERE membership_year IS NULL AND school_info->>'membershipYear' IS NOT NULL;

            ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(50);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) UNIQUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE gallery ADD COLUMN IF NOT EXISTS description TEXT;
            
            -- Backfill student_id in users table from students table
            UPDATE users u SET student_id = s.id 
            FROM students s 
            WHERE s.user_id = u.id AND u.student_id IS NULL;

            -- Backfill section for admins if missing (assuming username is the section name)
            UPDATE users SET section = username WHERE role = 'admin' AND section IS NULL;
            
            -- Ensure all managers have the 'ሁሉም' section
            UPDATE users SET section = 'ሁሉም' WHERE role = 'manager' AND (section IS NULL OR section <> 'ሁሉም');
        `);

        console.log('Database schema initialized and updated');
        const { rows } = await query("SELECT * FROM users WHERE username = 'manager'");
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('manager123', 10);
            await query(
                "INSERT INTO users (username, password, name, role, section, status) VALUES ($1, $2, $3, $4, $5, $6)",
                ['manager', hashedPassword, 'Super Manager', 'manager', 'ሁሉም', 'active']
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
    initDb();
}

module.exports = initDb;
