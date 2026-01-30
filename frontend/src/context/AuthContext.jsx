import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth';

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

    // Validate session on mount
    useEffect(() => {
        const validateSession = async () => {
            const token = localStorage.getItem('token');

            // If we have a user in state but no token, logout immediately
            if (!token && user) {
                logout();
                return;
            }

            if (token) {
                try {
                    const res = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: { 'x-auth-token': token }
                    });

                    if (!res.ok) {
                        console.warn('Session invalid, logging out');
                        logout();
                    } else {
                        // Update user data from server to ensure sync
                        const userData = await res.json();
                        // Only update if necessary to avoid potential render loops if objects differ slightly
                        // (Simple check: if we have no user, or ID differs)
                        if (!user || user.id !== userData.id) {
                            setUser(userData);
                        }
                    }
                } catch (err) {
                    console.error('Session validation error:', err);
                }
            }
        };

        validateSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const [admins, setAdmins] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('notifications');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    const [attendanceHistory, setAttendanceHistory] = useState([]);

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/attendance`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setAttendanceHistory(Array.isArray(data) ? data : []);
            } else {
                setAttendanceHistory([]);
            }
        } catch (err) {
            console.error('Error fetching attendance history:', err);
            setAttendanceHistory([]);
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
            if (res.ok) {
                setStudents(Array.isArray(data) ? data : []);
            } else {
                console.error('Fetch students error:', data.message);
                setStudents([]);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setStudents([]);
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
            if (res.ok) {
                setActivityLog(Array.isArray(data) ? data : []);
            } else {
                setActivityLog([]);
            }
        } catch (err) {
            console.error('Error fetching activity log:', err);
            setActivityLog([]);
        }
    };

    useEffect(() => {
        if (user) {
            fetchStudents();
            fetchHistory();
            fetchActivityLog();

            // Session Timeout Logic (15 minutes)
            const TIMEOUT_DURATION = 10 * 60 * 1000;
            let timeoutId;

            const resetTimer = () => {
                if (timeoutId) clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    logout();
                    // Optional: You could show a notification or redirect
                    console.log('Session expired due to inactivity');
                }, TIMEOUT_DURATION);
            };

            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

            // Set up listeners
            events.forEach(event => window.addEventListener(event, resetTimer));

            // Initial timer start
            resetTimer();

            return () => {
                if (timeoutId) clearTimeout(timeoutId);
                events.forEach(event => window.removeEventListener(event, resetTimer));
            };
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

                const isUpdate = students.some(s => s.id === (studentData.studentId || studentData.id));
                const actionType = isUpdate ? 'student_update' : 'registration';

                // Create notification for recent registration
                const targetSection = studentData.serviceSection || studentData.service_section || 'all';
                const newNotification = {
                    id: Date.now(),
                    target: targetSection,
                    message: `${isUpdate ? 'Student updated' : 'New student registered'}: ${studentData.fullName || studentData.full_name || 'Unknown'} (${studentData.studentId || studentData.student_id || 'N/A'})`,
                    from: user?.name || 'System',
                    time: new Date().toISOString(),
                    readBy: [],
                    type: 'registration'
                };
                setNotifications(prev => [newNotification, ...prev].slice(0, 50));

                recordActivity(actionType, {
                    student: studentData.fullName || studentData.full_name,
                    studentId: studentData.studentId || studentData.student_id || studentData.id,
                    isUpdate
                });

                return true;
            } else {
                const error = await res.json();
                throw new Error(error.message);
            }
        } catch (err) {
            throw err;
        }
    };

    const approveStudent = async (studentId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/students/${studentId}/approve`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setStudents(prev => prev.map(s =>
                    s.id === studentId ? { ...s, status: 'Student' } : s
                ));
                recordActivity('approval', { studentId });
            } else {
                const error = await res.json();
                throw new Error(error.message);
            }
        } catch (err) {
            console.error('Approval Error:', err);
            throw err;
        }
    };

    const declineStudent = async (studentId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/students/${studentId}/decline`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setStudents(prev => prev.filter(s => s.id !== studentId));
                recordActivity('decline', { studentId });
            } else {
                const error = await res.json();
                throw new Error(error.message);
            }
        } catch (err) {
            console.error('Decline Error:', err);
            throw err;
        }
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
            Choir: 'መዝሙር',
            'እቅድ': 'እቅድ',
            'ትምህርት': 'ትምህርት',
            'ልማት': 'ልማት',
            'ባች': 'ባች',
            'ሙያ': 'ሙያ',
            'ቋንቋ': 'ቋንቋ',
            'አባላት': 'አባላት',
            'ኦዲት': 'ኦዲት',
            'ሂሳብ': 'ሂሳብ',
            'መዝሙር': 'መዝሙር'
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

    const updateStudent = async (studentId, updates) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                const updatedStudent = await res.json();
                setStudents(prev => prev.map(s =>
                    s.id === studentId ? { ...s, ...updatedStudent } : s
                ));
                recordActivity('student_updated', {
                    student: updates.fullName || updates.full_name || updates.name,
                    studentId
                });
                return true;
            }
        } catch (err) {
            console.error('Update student error:', err);
            throw err;
        }
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

    const dismissNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
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

    const resetPassword = async (studentId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/users/reset-password/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            const data = await res.json();
            if (res.ok) {
                recordActivity('password_reset', { studentId });
                return data.message;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Reset password error:', err);
            // Include details if available from the server
            const errorMessage = err.message || 'Failed to reset password';
            throw new Error(errorMessage);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                // Update user to clear mustChangePassword flag
                setUser(prev => ({ ...prev, mustChangePassword: false }));
                return data.message;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            throw err;
        }
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
        dismissNotification,
        attendanceHistory,
        saveAttendanceBatch,
        resetPassword,
        changePassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth is now exported from ./auth.js
