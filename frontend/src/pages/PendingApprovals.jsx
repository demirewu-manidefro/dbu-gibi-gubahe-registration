import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useNotifications } from '../context/NotificationContext';
import { createNotificationMessage } from '../utils/notificationHelpers';
import { CheckCircle, XCircle, Search, Clock, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



const PendingApprovals = () => {
    const { students, user, approveStudent, declineStudent, globalSearch, setGlobalSearch } = useAuth();
    const { addNotification } = useNotifications();

    if (user?.role !== 'admin' && user?.role !== 'manager') {
        return <div className="p-10 text-center text-gray-500">Access Denied</div>;
    }

    const [selectedStudent, setSelectedStudent] = useState(null);
    const mySection = user?.section;
    const isManager = user?.role === 'manager';

    const pendingStudents = students.filter(s =>
        (s.status || '').toLowerCase() === 'pending'
    ).filter(s => {
        // Filter 1: Must have a section (User requested to hide "Unassigned")
        if (!s.section || s.section === 'N/A' || s.section === 'Unassigned') return false;

        // Filter 2: If Admin, section must match
        if (!isManager && mySection) {
            return (s.section || '').trim().toLowerCase() === mySection.trim().toLowerCase();
        }

        return true;
    }).filter(s =>
        (s.name || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
        (s.id || '').toLowerCase().includes(globalSearch.toLowerCase())
    );

    const handleApprove = async (studentId) => {
        const student = students.find(s => s.id === studentId);
        await approveStudent(studentId);

        // Send notification to manager
        if (student) {
            const notif = createNotificationMessage.studentApproved(
                student.name || student.id,
                user?.name || user?.username
            );
            addNotification({ ...notif, from: user?.username });
        }
    };

    const handleDecline = async (studentId) => {
        const student = students.find(s => s.id === studentId);
        await declineStudent(studentId);

        // Send notification to manager
        if (student) {
            const notif = createNotificationMessage.studentDeclined(
                student.name || student.id,
                user?.name || user?.username,
                null
            );
            addNotification({ ...notif, from: user?.username });
        }
    };


    return (
        <div className="space-y-6">


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">በሂደት ላይ ያሉ ማረጋገጫዎች</h1>
                    <p className="text-gray-500 dark:text-gray-400">ለ {isManager ? 'ሁሉም ክፍላት' : (mySection || 'የእርስዎ ክፍል')} የተላኩ አዲስ ምዝገባዎችን ይገምግሙ እና ያጽድቁ።</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="በሂደት ላይ ያሉ ይፈልጉ..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {pendingStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700">
                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-full mb-4">
                        <Clock size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ምንም የሚጠብቅ ጥያቄ የለም</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-1">
                        በአሁኑ ሰዓት በእርስዎ ክፍል ውስጥ ማረጋገጫ የሚጠብቁ ተማሪዎች የሉም።
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {pendingStudents.map((student) => (
                            <motion.div
                                key={student.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm">
                                            {student.photoUrl || student.photo_url ? (
                                                <img src={student.photoUrl || student.photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (student.name || 'A').charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{student.name || 'Anonymous'}</h3>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{student.id}</div>
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        በሂደት ላይ
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">ስልክ:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{student.phone ? `+251${student.phone}` : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">የትምህርት ክፍል:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{student.dept || student.department || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">አመት:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{student.year || student.batch || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">ክፍል:</span>
                                        <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            {student.section || <span className="text-red-500 italic">Unassigned</span>}
                                            {/* Debug indicator for section mismatch */}
                                            {student.section && mySection && student.section.trim() !== mySection.trim() && !isManager && (
                                                <span title="Does not match your section" className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedStudent(student)}
                                        className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        title="ዝርዝር ይመልከቱ"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDecline(student.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
                                    >
                                        <XCircle size={18} />
                                        ውድቅ አድርግ
                                    </button>
                                    <button
                                        onClick={() => handleApprove(student.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-200 dark:shadow-none transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        አጽድቅ
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* View Student Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">የአመልካች ዝርዝር</h2>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Header Profile */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl overflow-hidden">
                                        {selectedStudent.photoUrl || selectedStudent.photo_url ? (
                                            <img src={selectedStudent.photoUrl || selectedStudent.photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (selectedStudent.name || 'A').charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                                        <p className="text-gray-500 dark:text-gray-400">{selectedStudent.id}</p>
                                        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-xs font-bold">
                                            ሁኔታ: {selectedStudent.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">የግል መረጃ</h4>
                                        <InfoRow label="ስልክ" value={selectedStudent.phone ? `+251${selectedStudent.phone}` : 'N/A'} />
                                        <InfoRow label="የአደጋ ጊዜ ስልክ" value={selectedStudent.emergencyPhone || selectedStudent.emergency_phone} />
                                        <InfoRow label="ጾታ" value={selectedStudent.gender || selectedStudent.sex} />
                                        <InfoRow label="እድሜ" value={selectedStudent.age} />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">የትምህርት መረጃ</h4>
                                        <InfoRow label="የትምህርት ክፍል" value={selectedStudent.dept || selectedStudent.department} />
                                        <InfoRow label="አመት/ባች" value={selectedStudent.year || selectedStudent.batch} />
                                        <InfoRow label="የምረቃ አመት" value={selectedStudent.graduationYear || selectedStudent.graduation_year} />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">መንፈሳዊ / ግቢ መረጃ</h4>
                                        <InfoRow label="የአገልግሎት ክፍል" value={selectedStudent.section || selectedStudent.service_section} highlight />
                                        <InfoRow label="የግቢ ስም" value={selectedStudent.gibiName || selectedStudent.gibi_name} />
                                        <InfoRow label="አጥቢያ ቤተክርስቲያን" value={selectedStudent.parishChurch || selectedStudent.parish_church} />

                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2">ማረጋገጫ</h4>
                                        <InfoRow label="የሞላው አካል" value={selectedStudent.filledBy || selectedStudent.filled_by} />
                                        <InfoRow label="ያረጋገጠው አካል" value={selectedStudent.verifiedBy || selectedStudent.verified_by} />
                                        <InfoRow label="የተመዘገበበት ቀን" value={selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'} />
                                    </div>
                                </div>

                                {/* Additional Info Area */}
                                {selectedStudent.additionalInfo && (
                                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">ተጨማሪ መረጃ</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedStudent.additionalInfo || selectedStudent.additional_info}</p>
                                    </div>
                                )}
                            </div>


                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const InfoRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center text-sm border-b border-gray-50 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`font-medium ${highlight ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full' : 'text-gray-900 dark:text-white'}`}>
            {value || <span className="text-gray-300 dark:text-gray-600 italic">N/A</span>}
        </span>
    </div>
);

export default PendingApprovals;
