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
    Activity,
    MessageSquare,
    Camera,
    Save,
    Settings,
    ArrowDownCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminManagement = () => {
    const { user, admins, toggleAdminStatus, registerAdmin, updateAdmin, sendNotification, students, demoteToStudent } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [newAdminData, setNewAdminData] = useState({
        name: '',
        username: '',
        password: '',
        section: 'እቅድ',
        photo_url: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingAdminId, setEditingAdminId] = useState(null);

    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setNewAdminData({ ...newAdminData, photo_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

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

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateAdmin(editingAdminId, newAdminData);
            } else {
                await registerAdmin(newAdminData);
            }
            setIsRegistering(false);
            setIsEditing(false);
            setEditingAdminId(null);
            setNewAdminData({ name: '', username: '', password: '', section: 'እቅድ', photo_url: '' });
            setPhotoPreview(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditModal = (admin) => {
        setNewAdminData({
            name: admin.name,
            username: admin.username,
            password: '', // Don't pre-fill password for security
            section: admin.section || 'እቅድ',
            photo_url: admin.photo_url || ''
        });
        setPhotoPreview(admin.photo_url);
        setEditingAdminId(admin.id);
        setIsEditing(true);
        setIsRegistering(true);
    };

    const openAddModal = () => {
        setNewAdminData({ name: '', username: '', password: '', section: 'እቅድ', photo_url: '' });
        setPhotoPreview(null);
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
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="አስተዳዳሪ በስም ይፈልጉ..."
                            className="pl-10 h-10 bg-gray-50/50 border-gray-200"
                        />
                    </div>
                    {/* Button Removed per request */}
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
                                                    admin.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{admin.name}</div>
                                                <div className="text-xs text-gray-400">ID: #00{admin.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">
                                        {admin.section || 'ያልተመደበ'}
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
                                            {new Date(admin.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ዛሬ
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(admin)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit Admin"
                                            >
                                                <UserIcon size={18} />
                                            </button>
                                            {admin.username !== 'manager' && (
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
                                            )}
                                            {admin.username === 'manager' && (
                                                <button
                                                    onClick={() => {
                                                        const confirmMsg = "እርግጠኛ ነዎት እራስዎን ወደ ተማሪነት ዝቅ ማድረግ ይፈልጋሉ?\n\nማስጠንቀቂያ፡ ይህን የአስተዳዳሪ ዳሽቦርድ ወዲያውኑ ማግኘት አይችሉም።\n\nከመቀጠልዎ በፊት ቢያንስ አንድ ሌላ ስራ አስኪያጅ መኖሩን ያረጋግጡ፣ አለበለዚያ ይህ እርምጃ አይሳካም።";
                                                        if (window.confirm(confirmMsg)) {
                                                            demoteToStudent(admin.id)
                                                                .then(msg => {
                                                                    alert(msg);
                                                                    // Redirect or logout logic is in AuthContext
                                                                })
                                                                .catch(err => alert("ያልተሳካ: " + err.message));
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                                    title="ወደ ተማሪነት ዝቅ አድርግ"
                                                >
                                                    <ArrowDownCircle size={18} />
                                                </button>
                                            )}
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <button
                                    onClick={() => setIsRegistering(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center font-bold">
                                    {isEditing ? <UserIcon size={24} /> : <UserPlus size={24} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'አስተዳዳሪን አርትዕ' : 'አዲስ አስተዳዳሪ'}</h2>
                                    <p className="text-sm text-gray-500">{isEditing ? 'የአስተዳዳሪ ዝርዝሮችን ያዘምኑ' : 'የስርዓት መዳረሻ ይፍጠሩ'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="flex flex-col items-center mb-4">
                                    <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-all">
                                        {photoPreview ? (
                                            <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <Camera size={32} className="text-gray-300" />
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">የመገለጫ ፎቶ ይስቀሉ</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">ሙሉ ስም</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAdminData.name}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400"
                                        placeholder="ምሳሌ፡ ዲያቆን አበበ"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">መለያ ስም (Username)</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={isEditing}
                                            value={newAdminData.username}
                                            onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                                            className={`w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400 ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="username"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{isEditing ? 'አዲስ የይለፍ ቃል (አማራጭ)' : 'የይለፍ ቃል'}</label>
                                        <input
                                            type="password"
                                            required={!isEditing}
                                            value={newAdminData.password}
                                            onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400"
                                            placeholder={isEditing ? 'ተመሳሳይ ለማድረግ ባዶ ይተው' : '••••••••'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">የተመደበበት ክፍል</label>
                                    <select
                                        value={newAdminData.section}
                                        onChange={(e) => setNewAdminData({ ...newAdminData, section: e.target.value })}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400"
                                    >
                                        <option value="እቅድ">እቅድ</option>
                                        <option value="ትምህርት">ትምህርት</option>
                                        <option value="ልማት">ልማት</option>
                                        <option value="ባች">ባች</option>
                                        <option value="ሙያ">ሙያ</option>
                                        <option value="ቋንቋ">ቋንቋ</option>
                                        <option value="አባላት">አባላት</option>
                                        <option value="ኦዲት">ኦዲት</option>
                                        <option value="ሂሳብ">ሂሳብ</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                    >
                                        {isEditing ? <Save size={18} /> : <UserPlus size={18} />}
                                        {isEditing ? 'ለውጦችን ያስቀምጡ' : 'መለያ ፍጠር'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;
