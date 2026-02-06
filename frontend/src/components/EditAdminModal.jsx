import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Camera,
    Save,
    X,
    Shield,
    Settings,
    UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EditAdminModal = ({ admin, onClose, onSubmit, isEditing }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [photoPreview, setPhotoPreview] = useState(admin?.photo_url || null);
    const [formData, setFormData] = useState({
        name: admin?.name || '',
        username: admin?.username || '',
        password: '',
        section: admin?.section || 'እቅድ',
        photo_url: admin?.photo_url || '',
        role: admin?.role || 'admin',
        status: admin?.status || 'active'
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData({ ...formData, photo_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const tabs = [
        { id: 0, label: 'መሠረታዊ', subLabel: 'መረጃ', icon: <User size={18} /> },
        { id: 1, label: 'ሥራ ድርሻ', subLabel: 'ክፍል', icon: <Shield size={18} /> },
        { id: 2, label: 'መለያ', subLabel: 'ደህንነት', icon: <Lock size={18} /> },
        { id: 3, label: 'ተጨማሪ', subLabel: 'ሁኔታ', icon: <Settings size={18} /> },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            >
                {/* Header - Matching EditStudentModal */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            {isEditing ? 'የአስተዳዳሪ መረጃ ማስተካከያ (Edit Admin)' : 'አዲስ አስተዳዳሪ (Add New Admin)'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isEditing ? `ለ${formData.name} መረጃዎችን ያሻሽሉ` : 'አዲስ የሲስተም አስተዳዳሪ መመዝገቢያ'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation - Matching EditStudentModal */}
                <div className="flex gap-2 px-8 pt-6 pb-2 border-b border-gray-50 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-600 hover:border-blue-300 dark:hover:border-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            <div className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                                {tab.icon}
                            </div>
                            <div className="text-left">
                                <div className="text-xs opacity-70 leading-none mb-0.5">{tab.subLabel}</div>
                                <div className="text-sm font-bold">{tab.label}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-gray-50/30 dark:bg-slate-900/30">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-3xl mx-auto"
                            >
                                {activeTab === 0 && (
                                    <div className="space-y-8 py-2">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="label-amharic">የአስተዳዳሪው ሙሉ ስም <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="አስገቡ..."
                                                    className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                                            <div className="relative mx-auto">
                                                <div className="w-32 h-32 rounded-2xl bg-gray-50 dark:bg-slate-700 border-2 border-dashed border-gray-200 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Camera size={32} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <label className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 shadow-lg transition-all">
                                                    <Camera size={18} />
                                                    <input type="file" className="hidden" onChange={handlePhotoChange} />
                                                </label>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="label-amharic text-xs text-gray-500">የፎቶ URL (አማራጭ)</label>
                                                <input
                                                    type="text"
                                                    placeholder="URL ያስገቡ..."
                                                    value={formData.photo_url}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, photo_url: e.target.value });
                                                        setPhotoPreview(e.target.value);
                                                    }}
                                                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                                        <div>
                                            <label className="label-amharic">የአስተዳዳሪው ደረጃ <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800 dark:text-white"
                                            >
                                                <option value="admin">አስተዳዳሪ (Admin)</option>
                                                <option value="manager">ዋና አስተዳዳሪ (Manager)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="label-amharic">የተመደበበት ክፍል <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.section}
                                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800 dark:text-white"
                                            >
                                                <option value="ሁሉም">ሁሉም (Super Manager)</option>
                                                <option value="እቅድ">እቅድ</option>
                                                <option value="ትምህርት">ትምህርት</option>
                                                <option value="ልማት">ልማት</option>
                                                <option value="ባች">ባች</option>
                                                <option value="ሙያ">ሙያ</option>
                                                <option value="ቋንቋ">ቋንቋ</option>
                                                <option value="አባላት">አባላት</option>
                                                <option value="ኦዲት">ኦዲት</option>
                                                <option value="ሂሳብ">ሂሳብ</option>
                                                <option value="መዝሙር">መዝሙር</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 2 && (
                                    <div className="max-w-md mx-auto space-y-6 py-2">
                                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-md space-y-6">
                                            <div className="flex items-center gap-4 text-blue-600 mb-2 justify-center">
                                                <Lock size={32} />
                                            </div>

                                            <div className="text-left space-y-4">
                                                <div>
                                                    <label className="label-amharic">መለያ ስም (Username) <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        required
                                                        disabled={isEditing}
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                        placeholder="username"
                                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold ${isEditing ? 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-dashed' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white'}`}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="label-amharic">
                                                        {isEditing ? 'አዲስ የይለፍ ቃል' : 'የይለፍ ቃል *'}
                                                    </label>
                                                    <input
                                                        type="password"
                                                        required={!isEditing}
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        placeholder={isEditing ? 'ተመሳሳይ ለማድረግ ባዶ ይተው' : '••••••••'}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-700 text-gray-800 dark:text-white font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 3 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="text-gray-400 uppercase text-[10px] font-black tracking-widest">የመለያ ሁኔታ</div>
                                            <div className={`text-2xl font-black uppercase tracking-tight ${formData.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {formData.status === 'active' ? 'Active' : 'Blocked'}
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${formData.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                Account {formData.status}
                                            </div>
                                        </div>

                                        <div className="bg-gray-900 p-8 rounded-3xl text-white flex flex-col justify-between relative overflow-hidden group">
                                            <div className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700">
                                                <Shield size={200} />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                                    <Settings size={24} className="text-blue-400" />
                                                </div>
                                                <h4 className="text-xl font-bold mb-2">የደህንነት መዝገብ</h4>
                                                <p className="text-gray-400 text-sm leading-relaxed">ይህ መለያ ለሲስተሙ አስተዳደር ከፍተኛ ፈቃድ አለው። እባክዎ ለደህንነቱ ጥንቃቄ ያድርጉ።</p>
                                            </div>
                                            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                <Shield size={14} />
                                                Protected System
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions - Matching EditStudentModal */}
                    <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                        >
                            ሰርዝ (Cancel)
                        </button>

                        <div className="flex items-center gap-3">
                            {activeTab > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(prev => prev - 1)}
                                    className="px-6 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    ወደኋላ (Back)
                                </button>
                            )}

                            {activeTab < tabs.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(prev => prev + 1)}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                >
                                    ቀጣይ (Next)
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                                >
                                    {isEditing ? <Save size={20} /> : <UserPlus size={20} />}
                                    {isEditing ? 'ለውጦችን ያስቀምጡ' : 'መለያ ፍጠር'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditAdminModal;
