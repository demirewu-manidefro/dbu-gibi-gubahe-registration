import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from local storage:', error);
            return null;
        }
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const [admins, setAdmins] = useState(() => {
        const sections = [
            'እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ',
            'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ'
        ];


        const initialAdmins = sections.map((section, i) => ({
            id: i + 1,
            username: section,
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

    const [activityLog, setActivityLog] = useState([]);

    const [notifications, setNotifications] = useState([]);

    const [attendanceHistory, setAttendanceHistory] = useState([]);

    const saveAttendanceBatch = (date, attendanceMap) => {
        // 1. Group new attendance by section
        const sectionStats = {}; // { sectionName: { present: 0, absent: 0, excused: 0, total: 0 } }

        // Initialize sections
        const allSections = ['እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ', 'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ'];
        allSections.forEach(s => sectionStats[s] = { present: 0, absent: 0, excused: 0, total: 0 });

        Object.entries(attendanceMap).forEach(([studentId, status]) => {
            const student = students.find(s => s.id === studentId);
            if (student && student.section && sectionStats[student.section]) {
                sectionStats[student.section].total++;
                if (status === 'present') sectionStats[student.section].present++;
                else if (status === 'absent') sectionStats[student.section].absent++;
                else if (status === 'excused') sectionStats[student.section].excused++;
            }
        });

        // 2. Create history records
        const newRecords = [];
        Object.entries(sectionStats).forEach(([section, stats]) => {
            if (stats.total > 0) {
                newRecords.push({
                    id: Date.now() + Math.random(),
                    date: date,
                    section: section,
                    present: stats.present,
                    absent: stats.absent,
                    excused: stats.excused,
                    total: stats.total,
                    percentage: Math.round((stats.present / stats.total) * 100)
                });
            }
        });

        // 3. Update State (Remove old records for this date/section if any, then add new)
        setAttendanceHistory(prev => {
            const filtered = prev.filter(r => r.date !== date); // Simple replacement for the date
            // Note: In a real app, you might want to merge, but replacing for the date is cleaner for now
            // However, since we process ALL sections here, replacing by date is fine if we submitted ALL.
            // If we only submitted one section, we should only replace that section.

            // Let's replace only sections that have new data
            const sectionsUpdated = newRecords.map(r => r.section);
            const keptRecords = prev.filter(r => !(r.date === date && sectionsUpdated.includes(r.section)));

            return [...keptRecords, ...newRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        recordActivity('attendance_submission', { date, count: Object.keys(attendanceMap).length });
    };

    const [students, setStudents] = useState([]);

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
            const updatedStudents = [...students];
            updatedStudents[existingStudentIndex] = {
                ...updatedStudents[existingStudentIndex],
                ...studentData,
                name: studentData.fullName || updatedStudents[existingStudentIndex].name,
                dept: studentData.department || updatedStudents[existingStudentIndex].dept,
                year: studentData.batch || updatedStudents[existingStudentIndex].year,
                section: assignedSection,
                phone: studentData.phone || updatedStudents[existingStudentIndex].phone,
                region: studentData.region || updatedStudents[existingStudentIndex].region,
                zone: studentData.zone || updatedStudents[existingStudentIndex].zone,
                woreda: studentData.woreda || updatedStudents[existingStudentIndex].woreda,
                kebele: studentData.kebele || updatedStudents[existingStudentIndex].kebele,
                emergencyName: studentData.emergencyName || updatedStudents[existingStudentIndex].emergencyName,
                emergencyPhone: studentData.emergencyPhone || updatedStudents[existingStudentIndex].emergencyPhone,
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
            if (studentData.username && !checkUsernameUnique(studentData.username)) {
                throw new Error('Username already taken');
            }

            const newStudent = {
                ...studentData,
                id: (studentData.username || studentData.studentId || '').trim(),
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
            Planning: 'እቅድ',
            Education: 'ትምህርት',
            Development: 'ልማት',
            Batch: 'ባች',
            Profession: 'ሙያ',
            Language: 'ቋንቋ',
            Members: 'አባላት',
            Audit: 'ኦዲት',
            Finance: 'ሂሳብ',
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

    const importStudents = (newStudents) => {
        setStudents(prev => {
            const updatedStudents = [...prev];
            newStudents.forEach(newStudent => {
                const existingIndex = updatedStudents.findIndex(s => s.id === newStudent.id);
                if (existingIndex >= 0) {
                    updatedStudents[existingIndex] = { ...updatedStudents[existingIndex], ...newStudent };
                } else {
                    updatedStudents.push(newStudent);
                }
            });
            return updatedStudents;
        });
        recordActivity('bulk_import', { count: newStudents.length });
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
        importStudents,
        approveStudent,
        declineStudent,
        notifications,
        sendNotification,
        markNotificationsRead,
        attendanceHistory,
        saveAttendanceBatch
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
