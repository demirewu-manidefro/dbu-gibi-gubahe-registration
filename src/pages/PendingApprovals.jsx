import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Search, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PendingApprovals = () => {
    const { students, user, approveStudent, declineStudent } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    if (user?.role !== 'admin' && user?.role !== 'manager') {
        return <div className="p-10 text-center text-gray-500">Access Denied</div>;
    }

    const mySection = user?.section;
    const isManager = user?.role === 'manager';

    const pendingStudents = students.filter(s =>
        s.status === 'Pending' && (
            isManager ||
            s.section === mySection ||
            !s.section ||
            s.section === 'N/A' ||
            // Handle case where section might be English vs Amharic mismatch, though usually strict
            (s.section && mySection && s.section.trim() === mySection.trim())
        )
    ).filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                    <p className="text-gray-500">Review and approve new student registrations for {isManager ? 'all sections' : mySection}.</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search pending..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                            {student.photoUrl ? (
                                                <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                student.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{student.name}</h3>
                                            <div className="text-xs text-gray-500 font-mono">{student.id}</div>
                                        </div>
                                    </div>
                                    <div className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        Pending
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Department:</span>
                                        <span className="font-medium text-gray-900">{student.dept || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Year:</span>
                                        <span className="font-medium text-gray-900">{student.year || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Section:</span>
                                        <span className="font-medium text-gray-900">{student.section}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => declineStudent(student.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                                    >
                                        <XCircle size={18} />
                                        Decline
                                    </button>
                                    <button
                                        onClick={() => approveStudent(student.id)}
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
        </div>
    );
};

export default PendingApprovals;
