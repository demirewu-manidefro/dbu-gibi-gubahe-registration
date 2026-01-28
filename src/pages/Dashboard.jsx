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

const Dashboard = () => {
    const { activityLog } = useAuth();
    const stats = [
        { label: 'Total Students', value: '1,240', sub: '+12% from last month', icon: <Users size={24} />, color: 'bg-blue-500' },
        { label: 'Graduating Class', value: '312', sub: 'Class of 2017/18', icon: <GraduationCap size={24} />, color: 'bg-church-red' },
        { label: 'Active Servants', value: '450', sub: 'Across 6 mahibers', icon: <Award size={24} />, color: 'bg-church-gold' },
        { label: 'Avg. Attendance', value: '88%', sub: 'Weekly Gubaes', icon: <TrendingUp size={24} />, color: 'bg-green-500' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100 group hover:border-church-gold transition-all cursor-default"
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
                            <Clock className="text-church-red" size={20} /> Recent Registration Activity
                        </h2>
                        <button className="text-sm font-bold text-church-red flex items-center gap-1 hover:underline">
                            View All Activity <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-premium overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {activityLog.map((log) => (
                                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-xs font-bold text-church-red">
                                            {log.admin.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">
                                                {log.admin} registered <span className="text-church-red">{log.student}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium">{new Date(log.time).toLocaleTimeString()} • {log.type}</div>
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
                        <Calendar className="text-church-gold" size={20} /> Upcoming Events
                    </h2>
                    <div className="bg-church-dark rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden h-full min-h-[400px]">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Church size={120} />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <div className="text-church-gold font-bold text-xs uppercase tracking-widest">Ongoing Registration</div>
                                <h3 className="text-2xl font-bold">2017 E.C. Batch One Enrollment</h3>
                                <p className="text-white/60 text-sm leading-relaxed">Please ensure all 1st year students are registered before the fasting season starts.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="bg-church-gold p-2 rounded-xl text-church-dark">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Choir Audition</div>
                                        <div className="text-xs text-white/40">Feb 12 • 2:00 PM</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="bg-church-red p-2 rounded-xl text-white">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Saint Bashir Fasting</div>
                                        <div className="text-xs text-white/40">Starts in 3 Days</div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white text-church-dark rounded-2xl font-bold shadow-xl hover:bg-gray-100 transition-all mt-6">
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
