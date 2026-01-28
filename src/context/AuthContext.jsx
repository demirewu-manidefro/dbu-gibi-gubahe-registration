import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admins, setAdmins] = useState(() => {
        // Initial 10 admins + 1 manager
        const initialAdmins = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            username: `admin${i + 1}`,
            password: `pass${i + 1}`,
            name: `Admin User ${i + 1}`,
            role: 'admin',
            status: 'active',
            lastActivity: new Date().toISOString(),
        }));

        initialAdmins.push({
            id: 0,
            username: 'manager',
            password: 'managerpassword',
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

    const [students, setStudents] = useState([
        { id: 'DBU/123/15', name: 'Abebe Kebebe', dept: 'Mechanical', year: '3', section: 'Choir', status: 'Active' },
        { id: 'DBU/456/15', name: 'Mulugeta Tesfaye', dept: 'Economics', year: '2', section: 'Education', status: 'Active' },
        { id: 'DBU/789/15', name: 'Hiwot Alemu', dept: 'Medicine', year: '1', section: 'Charity', status: 'Active' },
        { id: 'DBU/101/14', name: 'Tewodros Kassahun', dept: 'Architecture', year: '4', section: 'Development', status: 'Active' },
        { id: 'DBU/202/13', name: 'Selam Mengistu', dept: 'Journalism', year: '5', section: 'PR', status: 'Graduated' },
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

    const registerStudent = (studentData) => {
        const newStudent = {
            id: `DBU/${Math.floor(Math.random() * 900) + 100}/${new Date().getFullYear() % 100}`,
            name: studentData.fullName,
            dept: studentData.department,
            year: studentData.batch,
            section: studentData.serviceSection,
            status: 'Active'
        };
        setStudents(prev => [newStudent, ...prev]);
        recordActivity('registration', { student: newStudent.name });
    };

    const login = (username, password) => {
        const admin = admins.find(a => a.username === username && a.password === password);
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
        registerStudent
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
