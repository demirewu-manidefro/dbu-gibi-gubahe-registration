-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'admin', 'manager', 'student'
    section VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    must_change_password BOOLEAN DEFAULT FALSE,
    photo_url TEXT,
    student_id VARCHAR(50) UNIQUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students Table (Main Registration)
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY, -- DBU ID
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    age INT,
    birth_date DATE,
    baptismal_name VARCHAR(100),
    priesthood_rank VARCHAR(50),
    mother_tongue VARCHAR(50),
    other_languages TEXT,
    region VARCHAR(50),
    zone VARCHAR(50),
    woreda VARCHAR(50),
    kebele VARCHAR(50),
    phone VARCHAR(20),
    gibi_name VARCHAR(100),
    center_and_woreda VARCHAR(100),
    parish_church VARCHAR(100),
    emergency_name VARCHAR(100),
    emergency_phone VARCHAR(20),
    department VARCHAR(100),
    batch VARCHAR(20),
    school_info JSONB, -- { university, campus, faculty, department, batch, studentId }
    cumulative_gpa VARCHAR(20),
    membership_year INT,
    is_graduated BOOLEAN DEFAULT FALSE,
    graduation_year INT,
    service_section VARCHAR(50),
    responsibility JSONB, -- { y1, y2, y3, y4, y5, y6 }
    gpa JSONB, -- { y1, y2, y3, y4, y5, y6 }
    attendance JSONB, -- { y1, y2, y3, y4, y5, y6 }
    education_yearly JSONB, -- { y1, y2, y3, y4, y5, y6 }
    trainee_type VARCHAR(50),
    abinet_education VARCHAR(255),
    special_need TEXT,
    teacher_training JSONB, -- { level1, level2, level3 }
    leadership_training JSONB, -- { level1, level2, level3 }
    other_trainings TEXT,
    additional_info TEXT,
    filled_by VARCHAR(100),
    verified_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Student', 'Graduated'
    photo_url TEXT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance_history (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    section VARCHAR(50) NOT NULL,
    present INT DEFAULT 0,
    absent INT DEFAULT 0,
    excused INT DEFAULT 0,
    total INT DEFAULT 0,
    percentage INT DEFAULT 0,
    UNIQUE(date, section)
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    admin_name VARCHAR(100),
    details JSONB,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'success'
);


-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    year INT NOT NULL,
    uploaded_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Schedules Table (Temporary/Session-based)
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
