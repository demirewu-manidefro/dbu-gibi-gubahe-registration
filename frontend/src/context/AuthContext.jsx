import { useState, useEffect } from 'react';
import { AuthContext } from './auth';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
const setToken = (token, remember) => {
    if (remember) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
    } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
    }
};
const removeToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
};

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
            const token = getToken();

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
                        // Always update user data to capture profile changes (photo, name, etc.)
                        setUser(userData);
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
    const fetchAdmins = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/admins`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setAdmins(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
    };

    const [activityLog, setActivityLog] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');

    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [gallery, setGallery] = useState([]);

    const fetchGallery = async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/gallery`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                setGallery(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Error fetching gallery:', err);
        }
    };

    const uploadGalleryItem = async (itemData) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/gallery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(itemData)
            });
            const data = await res.json();
            if (res.ok) {
                setGallery(prev => [data, ...prev]);
                recordActivity('gallery_upload', { title: itemData.title, year: itemData.year });
                return true;
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            throw err;
        }
    };

    const deleteGalleryItem = async (id) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/gallery/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setGallery(prev => prev.filter(item => item.id !== id));
                return true;
            }
        } catch (err) {
            console.error('Delete Error:', err);
            throw err;
        }
    };

    const fetchHistory = async () => {
        const token = getToken();
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

        const token = getToken();
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
        const token = getToken();
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
        const token = getToken();
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
            fetchNotifications();
            fetchAdmins();
            fetchGallery();

            // Poll notifications every 30 seconds
            const notifInterval = setInterval(fetchNotifications, 30000);

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
                clearInterval(notifInterval);
                events.forEach(event => window.removeEventListener(event, resetTimer));
            };
        }
    }, [user]);

    const [students, setStudents] = useState([]);

    const recordActivity = async (type, details) => {
        const token = getToken();
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

            // Generate a local notification for the manager/admins to see
            // (Exclude 'registration' as it's handled separately in registerStudent)
            // (Exclude 'message' as it's handled in sendNotification)
            if (type !== 'registration' && type !== 'student_update' && type !== 'message' && type !== 'login') {
                const activityMessages = {
                    'approval': `Student Approved: ${details.studentId}`,
                    'decline': `Registration Declined: ${details.studentId}`,
                    'admin_created': `New Admin Created: ${details.adminName} (${details.section})`,
                    'admin_updated': `Admin Info Updated: ${details.adminName}`,
                    'admin_demoted': `Admin Demoted to Student: ${details.adminName}`,
                    'bulk_import': `Bulk Import: ${details.count} students imported`,
                    'student_deleted': `Student Deleted: ${details.student}`,
                    'student_updated': `Student Info Updated: ${details.student}`
                };

                const message = activityMessages[type];
                if (message) {
                    
                    fetchNotifications();
                }
            }
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

    const signup = async (username, password, section) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, section })
            });

            const responseText = await res.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                // If response is not JSON (e.g. 500 Error HTML), use text or default message
                throw new Error(res.ok ? 'Server returned invalid response' : (responseText || 'Server error'));
            }

            if (res.ok) {
                return true;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error("Signup error:", err);
            throw err;
        }
    };

    const registerStudent = async (studentData) => {
        const token = getToken();
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

            // Get the response text first to handle both JSON and HTML responses
            const responseText = await res.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                // Response is not valid JSON (likely HTML error page)
                console.error('Server returned non-JSON response:', responseText.substring(0, 200));
                throw new Error('Server error - please ensure the backend server is running on port 5000');
            }

            if (res.ok) {
                // Capture the updated student data
                const savedStudent = responseData;
                fetchStudents();

                // If this is the current user (updating their own profile), update user state immediately
                if (user && (user.id === savedStudent.user_id || user.student_id === savedStudent.id || user.role === 'student')) {
                    setUser(prev => ({ ...prev, ...savedStudent }));
                }

                const isUpdate = students.some(s => s.id === (studentData.studentId || studentData.id));
                const actionType = isUpdate ? 'student_update' : 'registration';

                // Create notification for recent registration
                // Notification is created by backend
                fetchNotifications();

                recordActivity(actionType, {
                    student: studentData.fullName || studentData.full_name,
                    studentId: studentData.studentId || studentData.student_id || studentData.id,
                    isUpdate
                });

                return true;
            } else {
                throw new Error(responseData.message || 'Registration failed');
            }
        } catch (err) {
            throw err;
        }
    };

    const approveStudent = async (studentId) => {
        const token = getToken();
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
        const token = getToken();
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

    const registerAdmin = async (adminData) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/admins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(adminData)
            });

            if (res.ok) {
                const newAdmin = await res.json();
                setAdmins(prev => [...prev, newAdmin]);
                recordActivity('admin_created', { adminName: newAdmin.name, section: newAdmin.section });
                return true;
            } else {
                const error = await res.json();
                throw new Error(error.message || 'Failed to register admin');
            }
        } catch (err) {
            console.error('Register admin error:', err);
            throw err;
        }
    };

    const updateStudent = async (studentId, updates) => {
        const token = getToken();
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
            } else {
                const errorData = await res.json().catch(() => ({ message: 'Update failed' }));
                throw new Error(errorData.message || 'ውሂቡን ማስቀመጥ አልተቻለም');
            }
        } catch (err) {
            console.error('Update student error:', err);
            throw err;
        }
    };

    const deleteStudent = async (studentId) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setStudents(prev => prev.filter(s => s.id !== studentId));
                recordActivity('student_deleted', { student: studentId });
                return true;
            } else {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete student');
            }
        } catch (err) {
            console.error('Delete student error:', err);
            throw err;
        }
    };

    const importStudents = async (newStudents) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/students/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(newStudents)
            });

            const data = await res.json();

            if (res.ok) {
                // Refresh list from server
                await fetchStudents();
                recordActivity('bulk_import', { count: data.results.success, failed: data.results.failed });
                return data.results; // Return results for UI feedback
            } else {
                throw new Error(data.message || 'Import failed');
            }
        } catch (err) {
            console.error('Import error:', err);
            throw err;
        }
    };

    const sendNotification = async ({ target, message }) => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    type: 'message',
                    message,
                    target: target || 'all'
                })
            });
            if (res.ok) {
                fetchNotifications();
                return true;
            }
        } catch (err) {
            console.error('Error sending notification:', err);
            throw err;
        }
    };

    const markNotificationsRead = async (username, notificationId = null) => {
        const token = getToken();
        if (!token) return;

        try {
            if (notificationId) {
                // Mark single notification as read in backend
                await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    headers: { 'x-auth-token': token }
                });
            } else {
                // If notificationId is null, it's a "Mark All Read" request
                // Ideally there should be a backend endpoint for this.
                // For now, we update local state and maybe it's enough for the session.
            }

            setNotifications(prev => prev.map(n => {
                if (notificationId && n.id !== notificationId) return n;
                return n.readBy && n.readBy.includes(username) ? n : { ...n, readBy: [...(n.readBy || []), username] };
            }));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const dismissNotification = async (notificationId) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            console.error('Error dismissing notification:', err);
        }
    };

    const login = async (username, password, remember = false) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                setToken(data.token, remember);
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
        removeToken();
        setUser(null);
    };

    const toggleAdminStatus = async (adminId) => {
        if (user?.role !== 'manager') return;
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/admins/${adminId}/status`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const updatedAdmin = await res.json();
                setAdmins(prev => prev.map(a =>
                    a.id === adminId ? { ...a, status: updatedAdmin.status } : a
                ));
            }
        } catch (err) {
            console.error('Toggle admin status error:', err);
        }
    };

    const updateAdmin = async (adminId, adminData) => {
        if (user?.role !== 'manager') return;
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/admins/${adminId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(adminData)
            });
            const data = await res.json();
            if (res.ok) {
                setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, ...data } : a));
                recordActivity('admin_updated', { adminName: data.name, section: data.section });
                return true;
            } else {
                throw new Error(data.message || 'Failed to update admin');
            }
        } catch (err) {
            console.error('Update admin error:', err);
            throw err;
        }
    };

    const resetPassword = async (studentId) => {
        const token = getToken();
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
        const token = getToken();
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

    const updateProfile = async (profileData) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(prev => ({ ...prev, ...data }));
                return true;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Update profile error:', err);
            throw err;
        }
    };

    const makeStudentAdmin = async (studentId) => {
        if (user?.role !== 'manager') return;
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/make-admin/${studentId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                recordActivity('admin_created', { adminName: `Promoted Student ${studentId}`, section: 'Promoted' });
                return data.message;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Make admin error:', err);
            throw err;
        }
    };

    const makeSuperManager = async (studentId) => {
        if (user?.role !== 'manager') return;
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/make-super-manager/${studentId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                recordActivity('system', { type: 'promotion', detail: `Student ${studentId} promoted to Super Manager` });
                return data.message;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Make super manager error:', err);
            throw err;
        }
    };

    const demoteToStudent = async (adminId) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_BASE_URL}/users/demote/${adminId}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                recordActivity('admin_demoted', { adminName: `Demoted User ${adminId}`, section: 'Demoted' });
                // If the user demoted themselves, logout
                if (user.id === adminId) {
                    logout();
                } else {
                    // Update admin list
                    fetchAdmins();
                }
                return data.message;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Demote error:', err);
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
        updateAdmin,
        updateProfile,
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
        changePassword,
        makeStudentAdmin,
        globalSearch,
        setGlobalSearch,
        gallery,
        fetchGallery,
        uploadGalleryItem,
        deleteGalleryItem,
        makeSuperManager,
        demoteToStudent
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// useAuth is now exported from ./auth.js
