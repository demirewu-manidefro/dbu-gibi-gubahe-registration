import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useNotifications } from '../context/NotificationContext';
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
    BarChart3,
    Camera,
    ShieldCheck as CheckCircle,
    Bell,
    MessageCircle,
    ClipboardCheck,
    GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout, globalSearch, setGlobalSearch } = useAuth();
    const { getNotificationsForUser, markAsRead, markAllAsRead, removeNotification, addNotification } = useNotifications();
    const location = useLocation();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [sending, setSending] = useState(false);

    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';
    const isAdmin = user?.role === 'admin';

    const menuItems = isManager
        ? [
            { title: 'ዳሽቦርድ', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { title: 'ትንታኔ', icon: <BarChart3 size={20} />, path: '/analytics' },
            { title: 'አዲስ ምዝገባ', icon: <UserPlus size={20} />, path: '/add-student' },
            { title: 'የተማሪዎች ዝርዝር', icon: <Users size={20} />, path: '/students' },
            { title: 'ተመርቀው የወጡ አባላት', icon: <GraduationCap size={20} />, path: '/graduates' },
            { title: 'አስተዳዳሪ', icon: <ShieldAlert size={20} />, path: '/admins' },
            { title: 'ጋለሪ', icon: <Camera size={20} />, path: '/gallery' },
        ]
        : isStudent
            ? [
                { title: 'ምዝገባን አሻሽል', icon: <UserPlus size={20} />, path: '/add-student' },
                { title: 'የግል መረጃ', icon: <Users size={20} />, path: '/students' },
            ]
            : [
                { title: 'ዳሽቦርድ', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
                { title: 'አዲስ ምዝገባ', icon: <UserPlus size={20} />, path: '/add-student' },
                { title: 'ማረጋገጫዎች', icon: <CheckCircle size={20} />, path: '/approvals' },
                { title: 'ክትትል', icon: <ClipboardCheck size={20} />, path: '/attendance' },
                { title: 'የተማሪዎች ዝርዝር', icon: <Users size={20} />, path: '/students' },
                { title: 'ተመርቀው የወጡ አባላት', icon: <GraduationCap size={20} />, path: '/graduates' },
                { title: 'የግል መረጃ ማስተካከያ', icon: <UserPlus size={20} />, path: '/profile' },
                // Add Gallery for 'እቅድ' admins
                ...(user?.section === 'እቅድ' ? [{ title: 'ጋለሪ', icon: <Camera size={20} />, path: '/gallery' }] : [])
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

    // Get user-specific notifications
    const userNotifications = getNotificationsForUser(user);
    const userAlerts = userNotifications.filter(n => n.type !== 'message');
    const userMessages = userNotifications.filter(n => n.type === 'message');

    const unreadAlerts = userAlerts.filter(n => !n.readBy.includes(user?.username)).length;
    const unreadMessages = userMessages.filter(n => !n.readBy.includes(user?.username)).length;

    const handleSendBroadcast = async () => {
        if (!broadcastMessage.trim()) return;

        setSending(true);
        try {
            addNotification({
                type: 'message',
                message: broadcastMessage.trim(),
                target: broadcastTarget,
                from: user?.username || user?.name
            });
            setBroadcastMessage('');
            setShowBroadcast(false);
        } catch (err) {
            alert('Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    // Mobile Overlay
    const Overlay = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
    );

    return (
        <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-800 dark:text-gray-100 transition-colors duration-300">
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
                className={`bg-blue-900 dark:bg-gray-800 text-white flex flex-col z-50 ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'relative'}`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-white/10 dark:border-gray-700">
                    <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                        <ShieldCheck size={24} className="text-blue-400" />
                    </div>
                    {(!isMobile && !sidebarOpen) ? null : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg whitespace-nowrap"
                        >
                            ደብረ ብርሃን ግቢ ጉባኤ
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
                                    : 'text-white/70 hover:bg-white/10:bg-gray-700 hover:text-white'
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

                <div className="p-4 border-t border-white/10 dark:border-gray-700 space-y-4">
                    <div className={`flex items-center gap-3 p-2 ${!isMobile && !sidebarOpen ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 font-bold flex-shrink-0 overflow-hidden shadow-inner border-2 border-white/20">
                            {user?.photo_url || user?.photoUrl ? (
                                <img src={user.photo_url || user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg lowercase">{(user?.name || 'ተ').charAt(0)}</span>
                            )}
                        </div>
                        {(!isMobile && !sidebarOpen) ? null : (
                            <div className="overflow-hidden">
                                <div className="font-bold truncate text-sm max-w-[140px] tracking-tight lowercase">{user?.name || 'ተጠቃሚ'}</div>
                                <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                                    {user?.role === 'admin' ? 'አስተዳዳሪ' : user?.role === 'manager' ? 'ማኔጀር' : user?.role === 'student' ? 'ተማሪ' : user?.role}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl hover:bg-blue-900/40:bg-gray-700 text-blue-400 transition-colors ${!isMobile && !sidebarOpen ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {(!isMobile && !sidebarOpen) ? null : <span className="font-medium whitespace-nowrap">ውጣ</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 z-20 transition-colors duration-300">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                        >
                            <Menu size={20} />
                        </button>

                    </div>

                    <div className="flex items-center gap-4 relative">
                        {/* Theme Toggle */}

                        {/* Notifications - Hidden for students */}
                        {!isStudent && (
                            <>
                                <button
                                    onClick={() => {
                                        setShowNotifications(prev => !prev);
                                        setShowMessages(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full relative transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadAlerts > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                            {unreadAlerts > 9 ? '9+' : unreadAlerts}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMessages(prev => !prev);
                                        setShowNotifications(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full relative transition-colors"
                                >
                                    <MessageCircle size={20} />
                                    {unreadMessages > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                            {unreadMessages > 9 ? '9+' : unreadMessages}
                                        </span>
                                    )}
                                </button>
                            </>
                        )}

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800">
                                        <div className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <Bell size={16} className="text-blue-600 dark:text-blue-400" />
                                            ማሳወቂያዎች
                                            {unreadAlerts > 0 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {unreadAlerts}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => markAllAsRead(user?.username)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300"
                                        >
                                            ሁሉንም እንደተነበበ ምልክት አድርግ
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {userAlerts.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">ምንም ማሳወቂያዎች የሉም</p>
                                            </div>
                                        ) : (
                                            userAlerts.map((n) => {
                                                const isUnread = !n.readBy.includes(user?.username);
                                                return (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markAsRead(n.id, user?.username)}
                                                        className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${isUnread ? 'bg-blue-50/50 dark:bg-gray-700/50' : ''}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {n.type === 'registration' && (
                                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                            አዲስ ምዝገባ
                                                                        </span>
                                                                    )}
                                                                    {n.type === 'approval' && (
                                                                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                            ጸድቋል
                                                                        </span>
                                                                    )}
                                                                    {n.type === 'decline' && (
                                                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                            ውድቅ ተደርጓል
                                                                        </span>
                                                                    )}
                                                                    {n.type === 'attendance' && (
                                                                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                            ክትትል
                                                                        </span>
                                                                    )}
                                                                    {n.type === 'info' && (
                                                                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                                                            ሰላምታ
                                                                        </span>
                                                                    )}
                                                                    {isUnread && (
                                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                                                    {n.message}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        ከ: {n.from}
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
                                                                className="text-gray-400 hover:text-red-600 dark:text-red-400 p-1"
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

                        {/* Messages Dropdown */}
                        {showMessages && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowMessages(false)}
                                />
                                <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800">
                                        <div className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <MessageCircle size={16} className="text-indigo-600 dark:text-indigo-400" />
                                            መልዕክቶች
                                            {unreadMessages > 0 && (
                                                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                    {unreadMessages}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowBroadcast(true)}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 bg-white/50 dark:bg-gray-700/50 px-2 py-1 rounded-lg"
                                        >
                                            + አዲስ መልዕክት
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {userMessages.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <MessageCircle size={48} className="mx-auto text-gray-200 dark:text-gray-600 mb-3" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">ምንም መልዕክቶች የሉም</p>
                                                <button
                                                    onClick={() => setShowBroadcast(true)}
                                                    className="mt-4 text-xs text-blue-600 font-bold hover:underline"
                                                >
                                                    የመጀመሪያውን መልዕክት ላክ
                                                </button>
                                            </div>
                                        ) : (
                                            userMessages.map((m) => {
                                                const isUnread = !m.readBy.includes(user?.username);
                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => removeNotification(m.id)}
                                                        className={`px-4 py-4 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-gray-700/30 transition-colors ${isUnread ? 'bg-indigo-50/20 dark:bg-gray-700/20' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs flex-shrink-0">
                                                                {(m.from || 'S').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-0.5">
                                                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">@{m.from}</span>
                                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                                                    {m.message}
                                                                </div>
                                                            </div>
                                                            {isUnread && (
                                                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shadow-sm shadow-indigo-200" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    {userMessages.length > 0 && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900 text-center border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={() => markAllAsRead(user?.username)}
                                                className="text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-indigo-400 transition-colors"
                                            >
                                                ሁሉንም እንደተነበበ ምልክት አድርግ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        <button className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full border border-gray-100 dark:border-gray-700 transition-colors">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
                                {user?.photo_url || user?.photoUrl ? (
                                    <img src={user.photo_url || user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="lowercase">{(user?.name || 'U').charAt(0)}</span>
                                )}
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:inline">{(user?.name || 'User').split(' ')[0]}</span>
                        </button>
                    </div>
                </header>

                {/* Broadcast Modal */}
                <AnimatePresence>
                    {showBroadcast && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowBroadcast(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                            >
                                <div className="bg-blue-900 p-8 text-white relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <button onClick={() => setShowBroadcast(false)} className="text-white/50 hover:text-white transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <MessageCircle size={28} className="text-blue-400" />
                                        አጠቃላይ መልዕክት
                                    </h3>
                                    <p className="text-blue-200 mt-2 text-sm font-medium">ለተማሪዎች ወይም ለአስተዳዳሪዎች አስቸኳይ መልዕክት ይላኩ</p>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ተቀባይ ይምረጡ</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'all', label: 'ሁሉም', color: 'bg-indigo-50/30 text-indigo-700 border-indigo-100' },
                                                { id: 'admin', label: 'ሁሉም አስተዳዳሪዎች', color: 'bg-blue-50/30 text-blue-700 border-blue-100' },
                                                { id: 'እቅድ', label: 'እቅድ Section', color: 'bg-emerald-50/30 text-emerald-700 border-emerald-100' },
                                                { id: 'ትምህርት', label: 'ትምህርት Section', color: 'bg-amber-50/30 text-amber-700 border-amber-100' }
                                            ].map(target => (
                                                <button
                                                    key={target.id}
                                                    onClick={() => setBroadcastTarget(target.id)}
                                                    className={`px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${broadcastTarget === target.id
                                                        ? `${target.color} border-current scale-[1.02] shadow-sm`
                                                        : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100:bg-gray-600'
                                                        }`}
                                                >
                                                    {target.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">የመልዕክት ይዘት</label>
                                        <textarea
                                            rows={4}
                                            value={broadcastMessage}
                                            onChange={(e) => setBroadcastMessage(e.target.value)}
                                            placeholder="መልዕክትዎን እዚህ ይጻፉ..."
                                            className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            disabled={sending || !broadcastMessage.trim()}
                                            onClick={handleSendBroadcast}
                                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700:bg-blue-600 transition-all shadow-xl shadow-blue-200/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                                        >
                                            {sending ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <MessageCircle size={20} />
                                                    መልዕክት ላክ
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

