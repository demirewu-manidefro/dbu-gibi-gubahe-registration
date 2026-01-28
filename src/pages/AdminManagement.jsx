import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    ShieldCheck,
    Ban,
    Unlock,
    Search,
    MessageSquare,
    Activity,
    User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminManagement = () => {
    const { user, admins, toggleAdminStatus } = useAuth();

    if (user?.role !== 'manager') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-full mb-6">
                    <Ban size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-500 mt-2 max-w-md">Only the system manager can access the admin management portal. Please contact the administrator if you believe this is an error.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Management</h1>
                    <p className="text-gray-500 font-medium">Manage system access and monitor admin performance</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Admins</div>
                            <div className="text-xl font-bold">{admins.filter(a => a.status === 'active').length}</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                            <Ban size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Blocked</div>
                            <div className="text-xl font-bold">{admins.filter(a => a.status === 'blocked').length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find admin by name..."
                            className="pl-10 h-10 bg-gray-50/50 border-gray-200"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-church-dark text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
                        <MessageSquare size={16} /> Broadcast Message
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Admin Name</th>
                                <th className="px-8 py-4">Username</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Last Activity</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {admins.filter(a => a.id !== 0).map((admin) => (
                                <motion.tr
                                    layout
                                    key={admin.id}
                                    className="hover:bg-gray-50/30 transition-colors"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-church-gold/10 text-church-gold flex items-center justify-center font-bold border border-church-gold/20">
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{admin.name}</div>
                                                <div className="text-xs text-gray-400">ID: #00{admin.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">
                                        @{admin.username}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${admin.status === 'active'
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {admin.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Activity size={12} />
                                            {new Date(admin.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Today
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-church-red transition-colors" title="Message Admin">
                                                <MessageSquare size={18} />
                                            </button>
                                            <button
                                                onClick={() => toggleAdminStatus(admin.id)}
                                                className={`p-2 rounded-lg transition-all ${admin.status === 'active'
                                                        ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                                                        : 'text-red-600 bg-red-50 hover:bg-green-50 hover:text-green-600'
                                                    }`}
                                                title={admin.status === 'active' ? 'Block Admin' : 'Unblock Admin'}
                                            >
                                                {admin.status === 'active' ? <Ban size={18} /> : <Unlock size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Broadcast Modal Mockup */}
            <div className="bg-gradient-to-r from-church-red to-red-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <MessageSquare size={120} />
                </div>
                <div className="relative z-10 max-w-xl">
                    <h3 className="text-2xl font-bold mb-2">Internal Communication</h3>
                    <p className="text-white/70 mb-6">Send a broadcast message to all 10 admins. This will appear as a notification on their dashboard immediately.</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Important: Registration deadline extended..."
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl flex-1 backdrop-blur-md"
                        />
                        <button className="bg-church-gold text-church-dark px-6 py-2 rounded-xl font-bold hover:bg-yellow-400 transition-all">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
