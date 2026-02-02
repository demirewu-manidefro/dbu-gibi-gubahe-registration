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

// Cookie-based notification storage (no database)
const COOKIE_NAME = 'app_notifications';
const COOKIE_EXPIRY = 7; // days

export const NotificationProvider = ({ children, currentUser }) => {
    const [notifications, setNotifications] = useState([]);

    // Load notifications from cookies on mount
    useEffect(() => {
        const loadNotifications = () => {
            try {
                const cookieData = Cookies.get(COOKIE_NAME);
                if (cookieData) {
                    const parsed = JSON.parse(cookieData);
                    setNotifications(Array.isArray(parsed) ? parsed : []);
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
                setNotifications([]);
            }
        };
        loadNotifications();
    }, []);

    // Save notifications to cookies whenever they change
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

    // Add a new notification
    const addNotification = ({ type, message, target, from, metadata = {} }) => {
        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type, // 'registration', 'approval', 'decline', 'attendance', 'message', etc.
            message,
            target, // 'manager', 'admin', section name, or 'all'
            from: from || currentUser?.username || 'System',
            time: new Date().toISOString(),
            readBy: [],
            metadata // Extra data like student_id, admin_name, etc.
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep max 100 notifications
        return newNotification;
    };

    // Mark notification as read
    const markAsRead = (notificationId, username) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId && !n.readBy.includes(username)
                    ? { ...n, readBy: [...n.readBy, username] }
                    : n
            )
        );
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
    };

    // Remove/dismiss a notification
    const removeNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    // Clear all notifications
    const clearAll = () => {
        setNotifications([]);
        Cookies.remove(COOKIE_NAME);
    };

    // Get notifications for specific user based on role
    const getNotificationsForUser = (user) => {
        if (!user) return [];

        const username = user.username;
        const role = user.role;
        const section = user.section;

        return notifications.filter(n => {
            // Students: No notifications (as per requirement)
            if (role === 'student') {
                return false;
            }

            // Manager: See all admin activity notifications
            if (role === 'manager') {
                return ['approval', 'decline', 'attendance', 'message'].includes(n.type) || n.target === 'manager' || n.target === 'all';
            }

            // Admin: See registration notifications for their section only
            if (role === 'admin') {
                if (n.type === 'registration') {
                    // Only show if student is in their section
                    return n.metadata?.section === section || n.target === section;
                }
                // Don't show admin activity confirmations
                if (['approval', 'decline', 'attendance'].includes(n.type)) {
                    return false;
                }
                // Show targeted messages
                return n.target === 'all' || n.target === username || n.target === section || n.target === 'admin';
            }

            return n.target === 'all' || n.target === username;
        });
    };

    const value = {
        notifications,
        addNotification,
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
