import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import {
    ShieldCheck,
    Ban,
    Unlock,
    Search,
    UserPlus,
    X,
    User as UserIcon,
    Edit,
    Activity,
    MessageSquare,
    Camera,
    Save,
    Settings,
    ArrowDownCircle
} from 'lucide-react';
import { formatEthiopianDateAmharic, formatEthiopianTime } from '../utils/ethiopianDateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import EditAdminModal from '../components/EditAdminModal';

const AdminManagement = () => {
    const { user, admins, toggleAdminStatus, registerAdmin, updateAdmin, sendNotification, students, demoteToStudent } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [editingAdmin, setEditingAdmin] = useState(null);

    const adminOptions = admins.filter((a) => a.role === 'admin');
    const filteredAdmins = admins
        .filter((a) => a.id !== 0)
        .filter((admin) => {
            const term = searchTerm.trim().toLowerCase();
            if (!term) return true;
            return (
                admin.name?.toLowerCase().includes(term) ||
                admin.section?.toLowerCase().includes(term) ||
                admin.username?.toLowerCase().includes(term)
            );
        });

    const handleRegister = async (adminData) => {
        try {
            if (isEditing) {
                await updateAdmin(editingAdmin.id, adminData);
            } else {
                await registerAdmin(adminData);
            }
            setIsRegistering(false);
            setIsEditing(false);
            setEditingAdmin(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setIsEditing(true);
        setIsRegistering(true);
    };

    const openAddModal = () => {
        setEditingAdmin(null);
        setIsEditing(false);
        setIsRegistering(true);
    };

    const handleBroadcastSend = () => {
        if (!broadcastMessage.trim()) return;
        sendNotification({ target: broadcastTarget, message: broadcastMessage.trim() });
        setBroadcastMessage('');
    };

    if (user?.role !== 'manager') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-full mb-6">
                    <Ban size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">መዳረሻ ተከልክሏል</h1>
                <p className="text-gray-500 mt-2 max-w-md">የአስተዳዳሪዎች ማስተዳደሪያ ገጽን ማግኘት የሚችለው የስርዓት አስተዳዳሪው ብቻ ነው። እባክዎ ይህ ስህተት ነው ብለው ካመኑ አስተዳዳሪውን ያነጋግሩ።</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">የአስተዳዳሪዎች አስተዳደር</h1>
                    <p className="text-gray-500 font-medium">የስርዓት መዳረሻን ያስተዳድሩ እና የአስተዳዳሪ አፈጻጸምን ይቆጣጠሩ</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">ንቁ አስተዳዳሪዎች</div>
                            <div className="text-xl font-bold">{admins.filter(a => a.status === 'active').length}</div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                            <Ban size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">ታግደዋል</div>
                            <div className="text-xl font-bold">{admins.filter(a => a.status === 'blocked').length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between gap-6 bg-white">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="አስተዳዳሪ በስም፣ በክፍል ወይንም በዩዘርኔም ይፈልጉ..."
                            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">የአስተዳዳሪ ስም</th>
                                <th className="px-8 py-4">ክፍል</th>
                                <th className="px-8 py-4">መለያ ስም (Username)</th>
                                <th className="px-8 py-4">ሁኔታ</th>
                                <th className="px-8 py-4">የመጨረሻ እንቅስቃሴ</th>
                                <th className="px-8 py-4 text-right">እርምጃዎች</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAdmins.map((admin) => (
                                <motion.tr
                                    layout
                                    key={admin.id}
                                    className="hover:bg-gray-50/30 transition-colors"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center font-bold border border-blue-400/20 overflow-hidden">
                                                {admin.photo_url ? (
                                                    <img src={admin.photo_url} alt={admin.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    admin.name?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{admin.name}</div>
                                                <div className="text-xs text-gray-400">ID: #00{admin.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                                            {admin.section}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">
                                        {admin.username}
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
                                            {formatEthiopianTime(admin.lastActivity)} ዛሬ
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(admin)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Admin"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {admin.role !== 'manager' && (
                                                <button
                                                    onClick={() => toggleAdminStatus(admin.id)}
                                                    className={`p-2 rounded-lg transition-all ${admin.status === 'active'
                                                        ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                                                        : 'text-red-600 bg-red-50 hover:bg-green-50 hover:text-green-600'
                                                        }`}
                                                    title={admin.status === 'active' ? 'Block Admin' : 'Unblock Admin'}
                                                >
                                                    {admin.status === 'active' ? <Ban size={16} /> : <Unlock size={16} />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const confirmMsg = admin.username === user.username
                                                        ? "እርግጠኛ ነዎት እራስዎን ወደ ተማሪነት ዝቅ ማድረግ ይፈልጋሉ?\n\nማስጠንቀቂያ፡ ይህን የአስተዳዳሪ ዳሽቦርድ ወዲያውኑ ማግኘት አይችሉም።"
                                                        : `እርግጠኛ ነዎት ${admin.name}ን ወደ ተማሪነት ዝቅ ማድረግ ይፈልጋሉ?`;

                                                    if (window.confirm(confirmMsg)) {
                                                        demoteToStudent(admin.id)
                                                            .then(msg => {
                                                                alert(msg);
                                                            })
                                                            .catch(err => alert("ያልተሳካ: " + err.message));
                                                    }
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                title="ወደ ተማሪነት ዝቅ አድርግ"
                                            >
                                                <ArrowDownCircle size={16} />
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <MessageSquare size={120} />
                </div>
                <div className="relative z-10 max-w-xl">
                    <h3 className="text-2xl font-bold mb-2">የውስጥ ግንኙነት</h3>
                    <p className="text-white/70 mb-6">ለአንድ አስተዳዳሪ ወይም ለሁሉም አስተዳዳሪዎች መልዕክት ይላኩ።</p>
                    <div className="flex flex-col gap-3">
                        <select
                            value={broadcastTarget}
                            onChange={(e) => setBroadcastTarget(e.target.value)}
                            className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-md"
                        >
                            <option value="all" className="text-gray-900">ሁሉም አስተዳዳሪዎች</option>
                            {adminOptions.map((admin) => (
                                <option key={admin.id} value={admin.username} className="text-gray-900">
                                    {admin.name} (@{admin.username})
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                placeholder="አስፈላጊ፡ የምዝገባ ጊዜ ተራዝሟል..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl flex-1 backdrop-blur-md"
                            />
                            <button
                                onClick={handleBroadcastSend}
                                className="bg-blue-400 text-blue-900 px-6 py-2 rounded-xl font-bold hover:bg-blue-300 transition-all"
                            >
                                ላክ
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            <AnimatePresence>
                {isRegistering && (
                    <EditAdminModal
                        admin={editingAdmin}
                        isEditing={isEditing}
                        onClose={() => setIsRegistering(false)}
                        onSubmit={handleRegister}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;
