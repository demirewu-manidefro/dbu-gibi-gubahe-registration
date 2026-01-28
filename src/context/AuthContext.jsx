import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admins, setAdmins] = useState(() => {
        const sections = [
            'እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ',
            'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ'
        ];


        const initialAdmins = sections.map((section, i) => ({
            id: i + 1,
            username: section, // Username is now the Amharic section name (e.g., 'እቅድ')
            password: `pass${i + 1}`,
            name: `${section} ክፍል`,
            section: section,
            role: 'admin',
            status: 'active',
            lastActivity: new Date().toISOString(),
        }));

        initialAdmins.push({
            id: 0,
            username: 'manager',
            password: 'manager123',
            name: 'Super Manager',
            role: 'manager',
            status: 'active',
        });

        return initialAdmins;
    });

    const [activityLog, setActivityLog] = useState([
        { id: 1, type: 'registration', admin: 'Admin 1', student: 'Student #1021', time: new Date().toISOString(), status: 'success' },
        { id: 2, type: 'registration', admin: 'Admin 2', student: 'Student #1022', time: new Date().toISOString(), status: 'success' },
    ]);

    const [notifications, setNotifications] = useState([]);

    const [students, setStudents] = useState([
        { id: 'DBU/123/15', name: 'Abebe Kebebe', dept: 'Mechanical', year: '3', section: 'Language', status: 'Student' },
        { id: 'DBU/456/15', name: 'Mulugeta Tesfaye', dept: 'Economics', year: '2', section: 'Education', status: 'Student' },
        { id: 'DBU/789/15', name: 'Hiwot Alemu', dept: 'Medicine', year: '1', section: 'Members', status: 'Student' },
        { id: 'DBU/101/14', name: 'Tewodros Kassahun', dept: 'Architecture', year: '4', section: 'Development', status: 'Student' },
        { id: 'DBU/202/13', name: 'Selam Mengistu', dept: 'Journalism', year: '5', section: 'Profession', status: 'Graduated' },
    ]);

    const recordActivity = (type, details) => {
        const newLog = {
            id: Date.now(),
            type,
            admin: user?.name || 'Unknown',
            ...details,
            time: new Date().toISOString(),
            status: 'success'
        };
        setActivityLog(prev => [newLog, ...prev].slice(0, 10));
    };

    const checkUsernameUnique = (username) => {
        const normalized = username.toLowerCase().trim();
        const adminExists = admins.some(a => a.username.toLowerCase() === normalized);
        const studentExists = students.some(s => s.username?.toLowerCase() === normalized);
        return !adminExists && !studentExists;
    };

    const registerStudent = (studentData) => {
        const existingStudentIndex = students.findIndex(s => s.username === studentData.username || s.id === studentData.id);


        const isStaff = user?.role === 'admin' || user?.role === 'manager';
        const newStatus = isStaff ? 'Student' : 'Pending';

        const assignedSection = user?.role === 'admin' && user?.section
            ? user.section
            : studentData.serviceSection || 'N/A';

        const photoUrl = studentData.profilePhoto && typeof studentData.profilePhoto !== 'string'
            ? URL.createObjectURL(studentData.profilePhoto)
            : (studentData.photoUrl || '');

        if (existingStudentIndex >= 0) {
            // Update existing student
            const updatedStudents = [...students];

            // Explicit merging to ensure all fields are captured correctly
            updatedStudents[existingStudentIndex] = {
                ...updatedStudents[existingStudentIndex],
                ...studentData, // Spread first to catch generic fields

                // Critical Field Mappings
                name: studentData.fullName || updatedStudents[existingStudentIndex].name,
                dept: studentData.department || updatedStudents[existingStudentIndex].dept,
                year: studentData.batch || updatedStudents[existingStudentIndex].year,
                section: assignedSection, // Calculated above

                // Contact Info
                phone: studentData.phone || updatedStudents[existingStudentIndex].phone,
                region: studentData.region || updatedStudents[existingStudentIndex].region,
                zone: studentData.zone || updatedStudents[existingStudentIndex].zone,
                woreda: studentData.woreda || updatedStudents[existingStudentIndex].woreda,
                kebele: studentData.kebele || updatedStudents[existingStudentIndex].kebele,

                // Emergency Contact
                emergencyName: studentData.emergencyName || updatedStudents[existingStudentIndex].emergencyName,
                emergencyPhone: studentData.emergencyPhone || updatedStudents[existingStudentIndex].emergencyPhone,

                // Spiritual
                baptismalName: studentData.baptismalName || updatedStudents[existingStudentIndex].baptismalName,
                priesthoodRank: studentData.priesthoodRank || updatedStudents[existingStudentIndex].priesthoodRank,
                courses: studentData.courses || updatedStudents[existingStudentIndex].courses,
                graduationYear: studentData.graduationYear || updatedStudents[existingStudentIndex].graduationYear,

                status: newStatus,
                photoUrl: photoUrl || updatedStudents[existingStudentIndex].photoUrl
            };
            setStudents(updatedStudents);
            recordActivity('registration_update', { student: updatedStudents[existingStudentIndex].name, section: assignedSection });
        } else {
            // Create New
            if (studentData.username && !checkUsernameUnique(studentData.username)) {
                throw new Error('Username already taken');
            }

            const newStudent = {
                ...studentData,
                id: (studentData.username || studentData.studentId || '').trim(),

                // Explicit Mappings for New Student
                name: studentData.fullName || studentData.username,
                dept: studentData.department,
                year: studentData.batch,
                section: assignedSection,

                phone: studentData.phone,
                region: studentData.region,
                zone: studentData.zone,
                woreda: studentData.woreda,
                kebele: studentData.kebele,

                emergencyName: studentData.emergencyName,
                emergencyPhone: studentData.emergencyPhone,

                baptismalName: studentData.baptismalName,
                priesthoodRank: studentData.priesthoodRank,
                courses: studentData.courses,
                graduationYear: studentData.graduationYear,

                status: newStatus,
                photoUrl,
                username: studentData.username,
                password: studentData.password
            };
            setStudents(prev => [newStudent, ...prev]);
            recordActivity('registration', { student: newStudent.name, section: assignedSection });
        }
    };

    const approveStudent = (studentId) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status: 'Student' } : s
        ));
        recordActivity('approval', { studentId });
    };

    const declineStudent = (studentId) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        recordActivity('decline', { studentId });
    };

    const registerAdmin = (adminData) => {
        const sectionLabelMap = {
            // English inputs
            Planning: 'እቅድ',
            Education: 'ትምህርት',
            Development: 'ልማት',
            Batch: 'ባች',
            Profession: 'ሙያ',
            Language: 'ቋንቋ',
            Members: 'አባላት',
            Audit: 'ኦዲት',
            Finance: 'ሂሳብ',
            // Amharic inputs (pass-through for safety)
            'እቅድ': 'እቅድ',
            'ትምህርት': 'ትምህርት',
            'ልማት': 'ልማት',
            'ባች': 'ባች',
            'ሙያ': 'ሙያ',
            'ቋንቋ': 'ቋንቋ',
            'አባላት': 'አባላት',
            'ኦዲት': 'ኦዲት',
            'ሂሳብ': 'ሂሳብ'
        };

        const sectionLabel = sectionLabelMap[adminData.section] || adminData.section;
        const derivedName = adminData.name?.trim() || `${sectionLabel} ክፍል`;

        const newAdmin = {
            id: admins.length + 1,
            ...adminData,
            name: derivedName,
            section: sectionLabel,
            role: 'admin',
            status: 'active',
            lastActivity: null
        };
        setAdmins(prev => [...prev, newAdmin]);
        recordActivity('admin_created', { adminName: newAdmin.name, section: newAdmin.section });
    };

    const updateStudent = (studentId, updates) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, ...updates } : s
        ));
        recordActivity('student_updated', { student: updates?.name || studentId });
    };

    const deleteStudent = (studentId) => {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        recordActivity('student_deleted', { student: studentId });
    };

    const sendNotification = ({ target, message }) => {
        const newNotification = {
            id: Date.now(),
            target,
            message,
            from: user?.name || 'Manager',
            time: new Date().toISOString(),
            readBy: []
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
        recordActivity('message', { target, message });
    };

    const markNotificationsRead = (username) => {
        setNotifications(prev => prev.map(n =>
            n.readBy.includes(username) ? n : { ...n, readBy: [...n.readBy, username] }
        ));
    };

    const login = (username, password) => {
        const normalizedUsername = (username || '').trim().toLowerCase();
        const normalizedPassword = (password || '').trim();

        // Check Admin
        const admin = admins.find(a =>
            (a.username || '').trim().toLowerCase() === normalizedUsername &&
            (a.password || '').trim() === normalizedPassword
        );

        if (admin) {
            if (admin.status === 'blocked') {
                throw new Error('This account is blocked. Please contact the manager.');
            }
            setUser(admin);
            setAdmins(prev => prev.map(a =>
                a.id === admin.id ? { ...a, lastActivity: new Date().toISOString() } : a
            ));
            return true;
        }

        // Check Student
        const student = students.find(s =>
            (s.username || '').trim().toLowerCase() === normalizedUsername &&
            (s.password || '').trim() === normalizedPassword
        );

        if (student) {
            setUser({ ...student, role: 'student' });
            return true;
        }

        throw new Error('Invalid username or password');
    };

    const logout = () => {
        setUser(null);
    };

    const toggleAdminStatus = (adminId) => {
        if (user?.role !== 'manager') return;
        setAdmins(prev => prev.map(a =>
            a.id === adminId ? { ...a, status: a.status === 'active' ? 'blocked' : 'active' } : a
        ));
    };

    const value = {
        user,
        admins,
        activityLog,
        students,
        login,
        logout,
        toggleAdminStatus,
        recordActivity,
        registerStudent,
        registerAdmin,
        updateStudent,
        deleteStudent,
        approveStudent,
        declineStudent,
        notifications,
        sendNotification,
        markNotificationsRead
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
