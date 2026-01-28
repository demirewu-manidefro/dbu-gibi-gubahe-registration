import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    UserPlus,
    Users,
    ShieldAlert,
    FileText,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Search,
    Bell,
    MessageCircle,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();

    const menuItems = [
        { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { title: 'New Registration', icon: <UserPlus size={20} />, path: '/register' },
        { title: 'Student Database', icon: <Users size={20} />, path: '/students' },
        { title: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    ];

    if (user?.role === 'manager') {
        menuItems.push({ title: 'Admin Management', icon: <ShieldAlert size={20} />, path: '/admins' });
    }

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden text-gray-800">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                className="bg-church-dark text-white flex flex-col relative z-30"
            >
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="bg-church-red p-2 rounded-lg flex-shrink-0">
                        <ShieldCheck size={24} className="text-church-gold" />
                    </div>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg whitespace-nowrap"
                        >
                            DBU Gibi Gubae
                        </motion.div>
                    )}
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.title}
                            to={item.path}
                            className={({ isActive }) =>
                                `group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${isActive
                                    ? 'bg-church-red text-white shadow-lg'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <div className="transition-transform group-hover:scale-110">
                                {item.icon}
                            </div>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-medium"
                                >
                                    {item.title}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-church-gold flex items-center justify-center text-church-dark font-bold">
                            {user?.name.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <div className="font-semibold truncate text-sm">{user?.name}</div>
                                <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-900/40 text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Sign Out</span>}
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
                        <div className="relative hidden md:block w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students by name or ID..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-church-red rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <MessageCircle size={20} />
                        </button>
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
                        <button className="flex items-center gap-2 p-1 pl-2 pr-3 hover:bg-gray-50 rounded-full border border-gray-100">
                            <div className="w-7 h-7 bg-church-red rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {user?.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium hidden sm:inline">{user?.name.split(' ')[0]}</span>
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

// Simple mock for missing icon
const ShieldCheck = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default Layout;
