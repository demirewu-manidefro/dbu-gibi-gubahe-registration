import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useNotifications } from '../context/NotificationContext';
import { createNotificationMessage } from '../utils/notificationHelpers';
import { CheckCircle, XCircle, Search, Clock, User, Eye, X } from 'lucide-react';
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
                    <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                    <p className="text-gray-500">Review and approve new student registrations for {isManager ? 'all sections' : (mySection || 'your section')}.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search pending..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {pendingStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Clock size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Pending Requests</h3>
                    <p className="text-gray-500 text-center max-w-sm mt-1">
                        There are no students waiting for approval in your section at the moment.
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
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
                                            {student.photoUrl || student.photo_url ? (
                                                <img src={student.photoUrl || student.photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                (student.name || 'A').charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{student.name || 'Anonymous'}</h3>
                                            <div className="text-xs text-gray-500 font-mono">{student.id}</div>
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        Pending
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-medium text-gray-900">{student.phone ? `+251${student.phone}` : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Department:</span>
                                        <span className="font-medium text-gray-900">{student.dept || student.department || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Year:</span>
                                        <span className="font-medium text-gray-900">{student.year || student.batch || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Section:</span>
                                        <span className="font-medium text-gray-900 flex items-center gap-1">
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
                                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                        title="See Details"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDecline(student.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                                    >
                                        <XCircle size={18} />
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => handleApprove(student.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-200 transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        Approve
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
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Applicant Details</h2>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Header Profile */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden">
                                        {selectedStudent.photoUrl || selectedStudent.photo_url ? (
                                            <img src={selectedStudent.photoUrl || selectedStudent.photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (selectedStudent.name || 'A').charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                                        <p className="text-gray-500">{selectedStudent.id}</p>
                                        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                            Status: {selectedStudent.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 border-b pb-2">Personal Info</h4>
                                        <InfoRow label="Phone" value={selectedStudent.phone ? `+251${selectedStudent.phone}` : 'N/A'} />
                                        <InfoRow label="Emergency Phone" value={selectedStudent.emergencyPhone || selectedStudent.emergency_phone} />
                                        <InfoRow label="Sex" value={selectedStudent.gender || selectedStudent.sex} />
                                        <InfoRow label="Age" value={selectedStudent.age} />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 border-b pb-2">Academic Info</h4>
                                        <InfoRow label="Department" value={selectedStudent.dept || selectedStudent.department} />
                                        <InfoRow label="Year/Batch" value={selectedStudent.year || selectedStudent.batch} />
                                        <InfoRow label="Graduation Year" value={selectedStudent.graduationYear || selectedStudent.graduation_year} />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 border-b pb-2">Spiritual / Gibi Info</h4>
                                        <InfoRow label="Service Section" value={selectedStudent.section || selectedStudent.service_section} highlight />
                                        <InfoRow label="Gibi Name" value={selectedStudent.gibiName || selectedStudent.gibi_name} />
                                        <InfoRow label="Parish Church" value={selectedStudent.parishChurch || selectedStudent.parish_church} />

                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 border-b pb-2">Verification</h4>
                                        <InfoRow label="Filled By" value={selectedStudent.filledBy || selectedStudent.filled_by} />
                                        <InfoRow label="Verified By" value={selectedStudent.verifiedBy || selectedStudent.verified_by} />
                                        <InfoRow label="Submission Date" value={selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'} />
                                    </div>
                                </div>

                                {/* Additional Info Area */}
                                {selectedStudent.additionalInfo && (
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <h4 className="font-bold text-gray-900 mb-2">Additional Info</h4>
                                        <p className="text-gray-600 text-sm">{selectedStudent.additionalInfo || selectedStudent.additional_info}</p>
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
    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
        <span className="text-gray-500">{label}</span>
        <span className={`font-medium ${highlight ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full' : 'text-gray-900'}`}>
            {value || <span className="text-gray-300 italic">N/A</span>}
        </span>
    </div>
);

export default PendingApprovals;
