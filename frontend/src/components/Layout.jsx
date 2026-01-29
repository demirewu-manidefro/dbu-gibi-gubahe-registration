import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout, notifications, markNotificationsRead } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);

    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';

    const menuItems = isManager
        ? [
            { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { title: 'Approvals', icon: <Clock size={20} />, path: '/approvals' },
            { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
            { title: 'New Registration', icon: <UserPlus size={20} />, path: '/add-student' },
            { title: 'Student List', icon: <Users size={20} />, path: '/students' },
            { title: 'Admin Management', icon: <ShieldAlert size={20} />, path: '/admins' },
            { title: 'Reports', icon: <FileText size={20} />, path: '/reports' },
        ]
        : isStudent
            ? [
                { title: 'New Registration', icon: <UserPlus size={20} />, path: '/add-student' },
            ]
            : [
                { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                { title: 'Approvals', icon: <Clock size={20} />, path: '/approvals' },
                { title: 'New Registration', icon: <UserPlus size={20} />, path: '/add-student' },
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
                        <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 font-bold flex-shrink-0">
                            {(user?.name || 'U').charAt(0)}
                        </div>
                        {(!isMobile && !sidebarOpen) ? null : (
                            <div className="overflow-hidden">
                                <div className="font-semibold truncate text-sm max-w-[140px]">{user?.name || 'User'}</div>
                                <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
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
                                n.target === 'all' || n.target === username
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
                                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowNotifications(true)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <MessageCircle size={20} />
                                    </button>
                                    {showNotifications && (
                                        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                                <div className="font-bold text-sm text-gray-800">Notifications</div>
                                                <button
                                                    onClick={() => {
                                                        if (username) markNotificationsRead(username);
                                                    }}
                                                    className="text-xs font-semibold text-blue-600"
                                                >
                                                    Mark all read
                                                </button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {userNotifications.length === 0 ? (
                                                    <div className="p-4 text-sm text-gray-500">No notifications</div>
                                                ) : (
                                                    userNotifications.map((n) => (
                                                        <div key={n.id} className="px-4 py-3 border-b border-gray-50">
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(n.time).toLocaleString()}
                                                            </div>
                                                            <div className="text-sm text-gray-800 mt-1">
                                                                {n.message}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                From: {n.from}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                        <button className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-gray-50 rounded-full border border-gray-100">
                            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {(user?.name || 'U').charAt(0)}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">{(user?.name || 'User').split(' ')[0]}</span>
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
