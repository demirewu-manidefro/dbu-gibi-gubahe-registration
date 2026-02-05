import React from 'react';
import {
    Users,
    GraduationCap,
    Calendar,
    TrendingUp,
    Clock,
    ChevronRight,
    Award,
    Church
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/auth';
import { formatEthiopianDateAmharic } from '../utils/ethiopianDateUtils';

const Dashboard = () => {
    const { activityLog, students, user, attendanceHistory } = useAuth();

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
                        <h1 className="text-3xl font-bold">እንኳን በደህና መጡ, {(user?.name || 'User').split(' ')[0]}!</h1>
                        <p className="text-white/80 max-w-2xl text-lg leading-relaxed">
                            እንኳን ወደ ደብረ ብርሀን ዩኒቨርሲቲ ግቢ ጉባኤ የተማሪዎች ፖርታል በደህና መጡ።
                        </p>
                        <div className="pt-4 flex flex-wrap gap-4">
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                                <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">መለያ ስም (Username)</div>
                                <div className="text-xl font-bold">{user?.username}</div>
                            </div>
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                                <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">የተማሪ መታወቂያ</div>
                                <div className="text-xl font-bold">
                                    {user?.student_id && user?.student_id !== user?.username ? user.student_id : (
                                        <span className="text-blue-400 text-sm font-medium italic">ምዝገባ በመጠባበቅ ላይ</span>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                                <div className="text-xs text-blue-200 uppercase tracking-widest font-bold">ክፍል</div>
                                <div className="text-xl font-bold">{user?.section || 'ጠቅላላ'}</div>
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
                            <h3 className="font-bold text-gray-900 text-lg">ቀጣይ ጉባኤ</h3>
                            <p className="text-gray-500">ፕሮግራም ይመልከቱ -&gt; </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const baseStudents = isManager
        ? students
        : students.filter(s => s.section === mySection);

    const activeStudents = baseStudents.filter(s => s.status === 'Student' && (s.full_name || s.name || '').toUpperCase() !== 'N/A');
    const graduatedStudents = baseStudents.filter(s => s.status === 'Graduated');

    const filteredLogs = isManager
        ? activityLog
        : activityLog.filter(log => log.admin === user?.name || (students.find(s => s.name === log.student)?.section === mySection));

    const stats = [
        {
            label: isManager ? 'አጠቃላይ ተማሪዎች' : `${mySection} ተማሪዎች`,
            value: activeStudents.length.toLocaleString(),
            sub: '+12% ካለፈው ወር',
            icon: <Users size={24} />,
            color: 'bg-blue-500'
        },
        {
            label: 'ተመራቂ ተማሪዎች',
            value: graduatedStudents.length.toLocaleString(),
            sub: 'የ 2017/18 ተመራቂ',
            icon: <GraduationCap size={24} />,
            color: 'bg-blue-600'
        },
        {
            label: 'ንቁ አገልጋዮች',
            value: activeStudents.length.toLocaleString(),
            sub: isManager ? 'በሁሉም ማኅበራት' : `በ ${mySection} ውስጥ`,
            icon: <Award size={24} />,
            color: 'bg-blue-400'
        },
        {
            label: 'አማካይ ክትትል',
            value: `${(() => {
                if (!attendanceHistory || attendanceHistory.length === 0) return 0;
                const totalPresent = attendanceHistory.reduce((acc, curr) => acc + (curr.present || 0), 0);
                const totalPotential = attendanceHistory.reduce((acc, curr) => acc + (curr.total || 0), 0);
                return totalPotential > 0 ? Math.round((totalPresent / totalPotential) * 100) : 0;
            })()}%`,
            sub: 'ሳምንታዊ ጉባኤዎች',
            icon: <TrendingUp size={24} />,
            color: 'bg-green-500'
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {isManager && (
                <div className="bg-blue-900/5 p-4 rounded-xl border border-blue-900/10 mb-6">
                    <h2 className="text-lg font-bold text-blue-900">የስራ አስኪያጅ አጠቃላይ እይታ</h2>
                    <p className="text-sm text-gray-600">በሁሉም ክፍሎች ያሉ አጠቃላይ ስታቲስቲክስን እየተመለከቱ ነው።</p>
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

        </div>
    );
};



export default Dashboard;
