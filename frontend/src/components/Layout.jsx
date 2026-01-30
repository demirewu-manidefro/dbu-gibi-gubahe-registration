import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/auth';
import {
    UserPlus,
    Users,
    ShieldAlert,
    ShieldCheck,
    FileText,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Search,
    Bell,
    MessageCircle,
    Settings,
    ClipboardCheck,
    Clock,
    BarChart3,
    ShieldCheck as CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout, notifications, markNotificationsRead, dismissNotification } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    const removeNotification = (notificationId) => {
        dismissNotification(notificationId);
    };

    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';

    const menuItems = isManager
        ? [
            { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
            { title: 'New Registration', icon: <UserPlus size={20} />, path: '/add-student' },
            { title: 'Student List', icon: <Users size={20} />, path: '/students' },
            { title: 'Admin Management', icon: <ShieldAlert size={20} />, path: '/admins' },
            { title: 'Reports', icon: <FileText size={20} />, path: '/reports' },
        ]
        : isStudent
            ? [
                { title: 'Update Registration', icon: <UserPlus size={20} />, path: '/add-student' },
                { title: 'My Information', icon: <Users size={20} />, path: '/students' },
            ]
            : [
                { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                { title: 'New Registration', icon: <UserPlus size={20} />, path: '/add-student' },
                { title: 'Approvals', icon: <CheckCircle size={20} />, path: '/approvals' },
                { title: 'Attendance', icon: <ClipboardCheck size={20} />, path: '/attendance' },
                { title: 'Student List', icon: <Users size={20} />, path: '/students' },
                { title: 'Reports', icon: <FileText size={20} />, path: '/reports' },
            ];

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && sidebarOpen) setSidebarOpen(false);
            if (!mobile && !sidebarOpen) setSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mobile Overlay
    const Overlay = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden"
        />
    );

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden text-gray-800">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && sidebarOpen && <Overlay />}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isMobile ? 280 : (sidebarOpen ? 260 : 80),
                    x: isMobile ? (sidebarOpen ? 0 : -280) : 0
                }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className={`bg-blue-900 text-white flex flex-col z-50 ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'relative'}`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                        <ShieldCheck size={24} className="text-blue-400" />
                    </div>
                    {(!isMobile && !sidebarOpen) ? null : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg whitespace-nowrap"
                        >
                            DBU Gibi Gubae
                        </motion.div>
                    )}
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/50 hover:text-white">
                            <X size={24} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.title}
                            to={item.path}
                            onClick={() => isMobile && setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <div className="transition-transform group-hover:scale-110 flex-shrink-0">
                                {item.icon}
                            </div>
                            {(!isMobile && !sidebarOpen) ? null : (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-medium whitespace-nowrap"
                                >
                                    {item.title}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-4">
                    <div className={`flex items-center gap-3 p-2 ${!isMobile && !sidebarOpen ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 font-bold flex-shrink-0 overflow-hidden shadow-inner border-2 border-white/20">
                            {user?.photo_url || user?.photoUrl ? (
                                <img src={user.photo_url || user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg lowercase">{(user?.name || 'U').charAt(0)}</span>
                            )}
                        </div>
                        {(!isMobile && !sidebarOpen) ? null : (
                            <div className="overflow-hidden">
                                <div className="font-bold truncate text-sm max-w-[140px] tracking-tight lowercase">{user?.name || 'User'}</div>
                                <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{user?.role}</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl hover:bg-blue-900/40 text-blue-400 transition-colors ${!isMobile && !sidebarOpen ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {(!isMobile && !sidebarOpen) ? null : <span className="font-medium whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        {!isStudent && (
                            <div className="relative hidden md:block w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students by name or ID..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full text-sm"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 relative">
                        {(() => {
                            const username = user?.username;
                            const userNotifications = notifications.filter(n =>
                                isManager || n.target === 'all' || n.target === username || n.target === user?.section
                            );
                            const unreadCount = userNotifications.filter(n => !n.readBy.includes(username)).length;
                            return (
                                <>
                                    <button
                                        onClick={() => setShowNotifications(prev => !prev)}
                                        className="p-2 hover:bg-gray-100 rounded-full relative"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowNotifications(true)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                    {showNotifications && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowNotifications(false)}
                                            />
                                            <div className="absolute right-0 top-12 w-96 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
                                                    <div className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                                        <Bell size={16} className="text-blue-600" />
                                                        Notifications
                                                        {unreadCount > 0 && (
                                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (username) markNotificationsRead(username);
                                                        }}
                                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                    >
                                                        Mark all read
                                                    </button>
                                                </div>
                                                <div className="max-h-96 overflow-y-auto">
                                                    {userNotifications.length === 0 ? (
                                                        <div className="p-8 text-center">
                                                            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                                                            <p className="text-sm text-gray-500">No notifications</p>
                                                        </div>
                                                    ) : (
                                                        userNotifications.map((n) => {
                                                            const isUnread = !n.readBy.includes(username);
                                                            return (
                                                                <div
                                                                    key={n.id}
                                                                    onClick={() => removeNotification(n.id)}
                                                                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors ${isUnread ? 'bg-blue-50/50' : ''}`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                {n.type === 'registration' && (
                                                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                                        New Registration
                                                                                    </span>
                                                                                )}
                                                                                {isUnread && (
                                                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-sm text-gray-800 font-medium">
                                                                                {n.message}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className="text-xs text-gray-500">
                                                                                    From: {n.from}
                                                                                </span>
                                                                                <span className="text-xs text-gray-400">•</span>
                                                                                <span className="text-xs text-gray-400">
                                                                                    {new Date(n.time).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                removeNotification(n.id);
                                                                            }}
                                                                            className="text-gray-400 hover:text-red-600 p-1"
                                                                            title="Remove notification"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                        <button className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-gray-50 rounded-full border border-gray-100 transition-colors">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                                {user?.photo_url || user?.photoUrl ? (
                                    <img src={user.photo_url || user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="lowercase">{(user?.name || 'U').charAt(0)}</span>
                                )}
                            </div>
                            <span className="text-sm font-bold text-gray-700 hidden sm:inline">{(user?.name || 'User').split(' ')[0]}</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
