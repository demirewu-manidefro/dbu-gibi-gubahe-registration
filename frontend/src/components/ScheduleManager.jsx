import React, { useState } from 'react';
import { Plus, X, Calendar, Clock, Bookmark, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleManager = ({ onAdd, onClearAll }) => {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        day: 'ሰኞ',
        time_range: '',
        activity: '',
        description: ''
    });

    const days = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ', 'እሁድ'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onAdd(formData);
            setFormData({
                day: 'ሰኞ',
                time_range: '',
                activity: '',
                description: ''
            });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-10">
            {!showForm ? (
                <div className="flex flex-wrap gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none transition-all group"
                    >
                        <Plus className="group-hover:rotate-90 transition-transform" size={24} />
                        <span>አዲስ መርሐ ግብር ጨምር</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (window.confirm('ሁሉንም መርሐ ግብሮች መሰረዝ ይፈልጋሉ?')) {
                                onClearAll();
                            }
                        }}
                        className="flex items-center gap-3 bg-red-50 text-red-600 hover:bg-red-100 px-8 py-4 rounded-2xl font-black transition-all border border-red-100"
                    >
                        <Trash2 size={24} />
                        <span>ሁሉንም አጽዳ</span>
                    </motion.button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-premium border border-blue-100 dark:border-slate-700 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <button
                            onClick={() => setShowForm(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                            <Plus size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">አዲስ መርሐ ግብር</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                                <Calendar size={14} className="text-blue-500" />
                                ቀን
                            </label>
                            <select
                                value={formData.day}
                                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold ring-2 ring-transparent focus:ring-blue-500 transition-all outline-none"
                                required
                            >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                                <Clock size={14} className="text-blue-500" />
                                ሰዓት 
                            </label>
                            <input
                                type="text"
                                value={formData.time_range}
                                onChange={(e) => setFormData({ ...formData, time_range: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold ring-2 ring-transparent focus:ring-blue-500 transition-all outline-none"
                                placeholder="ምሳሌ: 4-6 ሰዓት"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                                <Bookmark size={14} className="text-blue-500" />
                                መርሐ ግብር / ተግባር
                            </label>
                            <input
                                type="text"
                                value={formData.activity}
                                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold ring-2 ring-transparent focus:ring-blue-500 transition-all outline-none"
                                placeholder="ለምሳሌ: የሐሙስ ጉባኤ"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                                <FileText size={14} className="text-blue-500" />
                                ዝርዝር መግለጫ (አማራጭ)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-bold ring-2 ring-transparent focus:ring-blue-500 transition-all outline-none min-h-[120px] resize-none"
                                placeholder="ተጨማሪ መረጃ ካለ እዚህ ይጻፉ..."
                            />
                        </div>

                        <div className="md:col-span-2 pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'በማስቀመጥ ላይ...' : 'መርሐ ግብር አስቀምጥ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 py-4 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                            >
                                ሰርዝ
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default ScheduleManager;
