import React from 'react';
import { Clock, Calendar, Info, Trash2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleDisplay = ({ schedules, isAdmin, onDelete }) => {
    const [isDismissed, setIsDismissed] = React.useState(() => {
        // If it's an admin, don't dismiss (they need to manage it)
        if (isAdmin) return false;
        return localStorage.getItem('schedule_dismissed') === 'true';
    });

    // Group schedules by day
    const days = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ', 'እሁድ'];

    // Check if the current schedules are "new" compared to when it was dismissed
    // We can use the logic of checking the latest ID or length
    React.useEffect(() => {
        if (!isAdmin && schedules.length > 0) {
            const lastSeenCount = localStorage.getItem('schedule_last_count');
            if (lastSeenCount !== schedules.length.toString()) {
                setIsDismissed(false);
                localStorage.removeItem('schedule_dismissed');
            }
        }
    }, [schedules, isAdmin]);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('schedule_dismissed', 'true');
        localStorage.setItem('schedule_last_count', schedules.length.toString());
    };

    if (isDismissed && !isAdmin) return null;

    const groupedSchedules = days.reduce((acc, day) => {
        const daySchedules = schedules.filter(s => s.day === day);
        if (daySchedules.length > 0) {
            acc[day] = daySchedules;
        }
        return acc;
    }, {});

    const orderedDays = days.filter(day => groupedSchedules[day]);

    if (schedules.length === 0) {
        if (isAdmin) {
            return (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-premium border border-gray-100 dark:border-slate-700">
                    <Calendar className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ምንም መርሐ ግብር የለም</h3>
                    <p className="text-gray-500 dark:text-gray-400">ለጊዜው የተመዘገበ ሳምንታዊ መርሐ ግብር የለም።</p>
                </div>
            );
        }
        return null; // Don't show empty schedule to students
    }

    return (
        <div className="space-y-8 relative">
            {!isAdmin && (
                <button
                    onClick={handleDismiss}
                    className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-red-500 transition-all z-20"
                    title="Dismiss"
                >
                    <X size={20} />
                </button>
            )}

            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-4">
                <p className="text-blue-900 dark:text-blue-200 font-bold text-xl amharic-font">በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን!!</p>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg ring-4 ring-blue-50 dark:ring-blue-900/20">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">የሳምንቱ መርሐ ግብር</h2>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-widest">Weekly Program</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {orderedDays.map((day, dayIndex) => (
                        <motion.div
                            key={day}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: dayIndex * 0.1 }}
                            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-premium border border-gray-100 dark:border-slate-700 overflow-hidden group hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5 flex justify-between items-center">
                                <h3 className="text-2xl font-black text-white tracking-tighter">{day}</h3>
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white/90 text-xs font-bold uppercase tracking-widest">
                                    {groupedSchedules[day].length} መርሐ ግብሮች
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {groupedSchedules[day].map((item, i) => (
                                    <div
                                        key={item.id}
                                        className="relative pl-6 border-l-2 border-blue-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors py-2 group/item"
                                    >
                                        <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-blue-500 group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-tighter mb-1">
                                            <Clock size={12} />
                                            <span>{item.time_range}</span>
                                        </div>

                                        <h4 className="text-gray-900 dark:text-white font-extrabold text-lg leading-snug group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                            {item.activity}
                                        </h4>

                                        {item.description && (
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}

                                        {isAdmin && (
                                            <button
                                                onClick={() => onDelete(item.id)}
                                                className="absolute right-0 top-2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-400 p-6 rounded-3xl flex gap-4 items-start">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                    <Info size={24} />
                </div>
                <div>
                    <h5 className="text-orange-900 dark:text-orange-200 font-bold text-lg">ማሳሰቢያ</h5>
                    <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                        ይህ መርሐ ግብር ለሁሉም ተማሪዎች በእኩልነት የሚያገለግል ሲሆን በልዩ ሁኔታዎች ምክንያት ለውጦች ሊደረጉ ይችላሉ።
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDisplay;
