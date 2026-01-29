import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = 'http://localhost:5000/api';

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

    const [admins, setAdmins] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    const [notifications, setNotifications] = useState([]);

    const [attendanceHistory, setAttendanceHistory] = useState([]);

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/attendance`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setAttendanceHistory(data);
        } catch (err) {
            console.error('Error fetching attendance history:', err);
        }
    };

    const saveAttendanceBatch = async (date, attendanceMap) => {
        const sectionStats = {};
        const allSections = ['እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ', 'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ', 'መዝሙር'];
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

        const records = [];
        Object.entries(sectionStats).forEach(([section, stats]) => {
            if (stats.total > 0) {
                records.push({
                    date,
                    section,
                    present: stats.present,
                    absent: stats.absent,
                    excused: stats.excused,
                    total: stats.total,
                    percentage: Math.round((stats.present / stats.total) * 100)
                });
            }
        });

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ date, records })
            });
            if (res.ok) {
                fetchHistory();
                recordActivity('attendance_submission', { date, count: Object.keys(attendanceMap).length });
            }
        } catch (err) {
            console.error('Error saving attendance:', err);
        }
    };

    const fetchStudents = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/students`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
        }
    };

    const fetchActivityLog = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/activity`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setActivityLog(data);
        } catch (err) {
            console.error('Error fetching activity log:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStudents();
            fetchHistory();
            fetchActivityLog();
        }
    }, [user]);

    const [students, setStudents] = useState([]);

    const recordActivity = async (type, details) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await fetch(`${API_BASE_URL}/activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ type, details })
            });
            fetchActivityLog();
        } catch (err) {
            console.error('Error recording activity:', err);
        }
    };

    const checkUsernameUnique = (username) => {
        const normalized = username.toLowerCase().trim();
        const adminExists = admins.some(a => a.username.toLowerCase() === normalized);
        const studentExists = students.some(s => s.username?.toLowerCase() === normalized);
        return !adminExists && !studentExists;
    };

    const signup = async (username, password) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                return true;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            throw err;
        }
    };

    const registerStudent = async (studentData) => {
        const token = localStorage.getItem('token');
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) headers['x-auth-token'] = token;

            const res = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers,
                body: JSON.stringify(studentData)
            });
            if (res.ok) {
                fetchStudents();
                return true;
            } else {
                const error = await res.json();
                throw new Error(error.message);
            }
        } catch (err) {
            throw err;
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

    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return true;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
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
        signup,
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
