import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

// Cookie-based and Session-based notification storage (no database)
const COOKIE_NAME = 'app_notifications';
const SESSION_KEY = 'session_notifications';
const COOKIE_EXPIRY = 7; // days

export const NotificationProvider = ({ children, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [sessionNotifications, setSessionNotifications] = useState([]);

    // Load notifications from cookies and session on mount
    useEffect(() => {
        const loadNotifications = () => {
            try {
                // Persistent notifications (Cookies)
                const cookieData = Cookies.get(COOKIE_NAME);
                if (cookieData) {
                    const parsed = JSON.parse(cookieData);
                    setNotifications(Array.isArray(parsed) ? parsed : []);
                }

                // Session notifications (sessionStorage)
                const sessionData = sessionStorage.getItem(SESSION_KEY);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    setSessionNotifications(Array.isArray(parsed) ? parsed : []);
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        };
        loadNotifications();
    }, []);

    // Save persistent notifications to cookies
    useEffect(() => {
        if (notifications.length > 0) {
            try {
                Cookies.set(COOKIE_NAME, JSON.stringify(notifications), { expires: COOKIE_EXPIRY });
            } catch (error) {
                console.error('Error saving notifications:', error);
            }
        } else {
            Cookies.remove(COOKIE_NAME);
        }
    }, [notifications]);

    // Save session notifications to sessionStorage
    useEffect(() => {
        if (sessionNotifications.length > 0) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionNotifications));
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }, [sessionNotifications]);

    // Add a new notification (Persistent)
    const addNotification = ({ type, message, target, from, metadata = {} }) => {
        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            target,
            from: from || currentUser?.username || 'System',
            time: new Date().toISOString(),
            readBy: [],
            metadata
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 100));
        return newNotification;
    };

    // Add a session notification (Transient)
    const addSessionNotification = ({ type, message, target, from, metadata = {} }) => {
        const newNotification = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type || 'info',
            message,
            target: target || 'manager',
            from: from || 'System',
            time: new Date().toISOString(),
            isSession: true,
            readBy: [],
            metadata
        };

        setSessionNotifications(prev => [newNotification, ...prev]);
        return newNotification;
    };

    // Mark notification as read
    const markAsRead = (notificationId, username) => {
        // Check persistent notifications
        if (notificationId.startsWith('notif_')) {
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId && !n.readBy.includes(username)
                        ? { ...n, readBy: [...n.readBy, username] }
                        : n
                )
            );
        }
        // Session notifications disappear automatically once "seen" (marked as read)
        else if (notificationId.startsWith('session_')) {
            setSessionNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    // Mark all notifications as read for a user
    const markAllAsRead = (username) => {
        setNotifications(prev =>
            prev.map(n =>
                !n.readBy.includes(username)
                    ? { ...n, readBy: [...n.readBy, username] }
                    : n
            )
        );
        // Clear all session notifications on "Mark All as Read"
        setSessionNotifications([]);
    };

    // Remove/dismiss a notification
    const removeNotification = (notificationId) => {
        if (notificationId.startsWith('notif_')) {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } else {
            setSessionNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    // Clear all notifications
    const clearAll = () => {
        setNotifications([]);
        setSessionNotifications([]);
        Cookies.remove(COOKIE_NAME);
        sessionStorage.removeItem(SESSION_KEY);
    };

    // Get notifications for specific user based on role
    const getNotificationsForUser = (user) => {
        if (!user) return [];

        const username = user.username;
        const role = user.role;
        const section = user.section;

        const allAvailable = [...sessionNotifications, ...notifications];

        return allAvailable.filter(n => {
            if (role === 'student') return false;

            if (role === 'manager') {
                return ['approval', 'decline', 'attendance', 'message', 'info'].includes(n.type) || n.target === 'manager' || n.target === 'all';
            }

            if (role === 'admin') {
                if (n.type === 'registration') {
                    return n.metadata?.section === section || n.target === section;
                }
                if (['approval', 'decline', 'attendance'].includes(n.type)) {
                    return false;
                }
                return n.target === 'all' || n.target === username || n.target === section || n.target === 'admin';
            }

            return n.target === 'all' || n.target === username;
        });
    };

    const value = {
        notifications: [...sessionNotifications, ...notifications],
        sessionNotifications,
        addNotification,
        addSessionNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        getNotificationsForUser
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
