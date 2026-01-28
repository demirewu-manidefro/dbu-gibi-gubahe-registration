import React from 'react';
import {
    Users,
    GraduationCap,
    Calendar,
    TrendingUp,
    Clock,
    ChevronRight,
    Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatEthiopianDateAmharic } from '../utils/ethiopianDateUtils';

const Dashboard = () => {
    const { activityLog, students, user } = useAuth();

    // Filter data based on role
    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';
    const mySection = user?.section;

    if (isStudent) {
        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="bg-blue-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Church size={150} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h1 className="text-3xl font-bold">እንኳን በደህና መጡ, {user?.name.split(' ')[0]}!</h1>
                        <p className="text-white/80 max-w-2xl text-lg leading-relaxed">
                            Welcome to the DBU Gibi Gubae Student Portal.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                                <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">Student ID</div>
                                <div className="text-xl font-bold">{user?.username}</div>
                            </div>
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                                <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">Section</div>
                                <div className="text-xl font-bold">{user?.section || 'General'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* You can add specific student widgets here later if needed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                            <Calendar size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Upcoming Gubae</h3>
                            <p className="text-gray-500">Check schedule -&gt; </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const filteredStudents = isManager
        ? students
        : students.filter(s => s.section === mySection);

    const filteredLogs = isManager
        ? activityLog
        : activityLog.filter(log => log.admin === user?.name || (students.find(s => s.name === log.student)?.section === mySection));

    const stats = [
        {
            label: isManager ? 'Total Students' : `${mySection} Students`,
            value: filteredStudents.length.toLocaleString(),
            sub: '+12% from last month',
            icon: <Users size={24} />,
            color: 'bg-blue-500'
        },
        {
            label: 'Graduating Class',
            value: filteredStudents.filter(s => s.status === 'Graduated').length.toLocaleString(),
            sub: 'Class of 2017/18',
            icon: <GraduationCap size={24} />,
            color: 'bg-blue-600'
        },
        {
            label: 'Active Servants',
            value: filteredStudents.filter(s => s.status === 'Student').length.toLocaleString(),
            sub: isManager ? 'Across all mahibers' : `In ${mySection}`,
            icon: <Award size={24} />,
            color: 'bg-blue-400'
        },
        {
            label: 'Avg. Attendance',
            value: '88%',
            sub: 'Weekly Gubaes',
            icon: <TrendingUp size={24} />,
            color: 'bg-green-500'
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {isManager && (
                <div className="bg-blue-900/5 p-4 rounded-xl border border-blue-900/10 mb-6">
                    <h2 className="text-lg font-bold text-blue-900">Manager Overview</h2>
                    <p className="text-sm text-gray-600">You are viewing global statistics across all sections.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100 group hover:border-blue-400 transition-all cursor-default"
                    >
                        <div className={`p-4 rounded-2xl ${stat.color} text-white w-fit mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                            {stat.icon}
                        </div>
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
                        <div className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</div>
                        <div className="text-xs font-medium text-gray-500 mt-2 flex items-center gap-1">
                            {stat.sub}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="text-blue-600" size={20} /> Recent Registration Activity
                        </h2>
                        <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                            View All Activity <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {filteredLogs.map((log) => (
                                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-xs font-bold text-blue-600">
                                            {log.admin.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">
                                                {log.admin} registered <span className="text-blue-600">{log.student}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">
                                                {formatEthiopianDateAmharic(log.time)} • {new Date(log.time).toLocaleTimeString()} • {log.type}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-green-500 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                        {log.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-blue-400" size={20} /> Upcoming Events
                    </h2>
                    <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden h-full min-h-[400px]">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Church size={120} />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <div className="text-blue-400 font-bold text-xs uppercase tracking-widest">Ongoing Registration</div>
                                <h3 className="text-2xl font-bold">2017 E.C. Batch One Enrollment</h3>
                                <p className="text-white/60 text-sm leading-relaxed">Please ensure all 1st year students are registered before the fasting season starts.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="bg-blue-400 p-2 rounded-xl text-blue-900">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">General Meeting</div>
                                        <div className="text-xs text-white/40">Feb 12 • 2:00 PM</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Saint Bashir Fasting</div>
                                        <div className="text-xs text-white/40">Starts in 3 Days</div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white text-blue-900 rounded-2xl font-bold shadow-xl hover:bg-gray-100 transition-all mt-6">
                                + Add Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mock Church Icon
const Church = ({ size, className }) => (
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
        <path d="M10 20v-6h4v6" />
        <path d="M6 20V10l6-5 6 5v10" />
        <path d="m9 7 3-3 3 3" />
        <path d="M12 22V4" />
        <path d="M8 8h8" />
    </svg>
);

export default Dashboard;
