import React, { useMemo } from 'react';
import { useAuth } from '../context/auth';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Activity, Filter, Info, Clock } from 'lucide-react';
import EthiopianDatePicker from '../components/EthiopianDatePicker';

const Analytics = () => {
    const { attendanceHistory, user } = useAuth();
    const isManager = user?.role === 'manager';

    // Default range: Start of month to now
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const [startDate, setStartDate] = React.useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = React.useState(now.toISOString().split('T')[0]);
    const [selectedSection, setSelectedSection] = React.useState('All');

    // 1. Filtered Data based on Date Range
    const filteredHistory = useMemo(() => {
        return attendanceHistory.filter(d => {
            if (!d.date) return false;
            const recordDate = d.date.split('T')[0];
            const dateMatch = recordDate >= startDate && recordDate <= endDate;
            const sectionMatch = selectedSection === 'All' || d.section === selectedSection;
            return dateMatch && sectionMatch;
        });
    }, [attendanceHistory, startDate, endDate, selectedSection]);

    // 2. Aggregate Data for Top Cards
    const { totalPresent, totalPotential, totalSessions } = useMemo(() => {
        const tPresent = filteredHistory.reduce((acc, curr) => acc + (curr.present || 0), 0);
        const tPotential = filteredHistory.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const tSessions = new Set(filteredHistory.map(d => d.date.split('T')[0])).size;
        return { totalPresent: tPresent, totalPotential: tPotential, totalSessions: tSessions };
    }, [filteredHistory]);

    const overallAverage = totalPotential > 0 ? Math.round((totalPresent / totalPotential) * 100) : 0;

    // 3. Section Ranking (Bar Chart)
    const sections = ['እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ', 'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ', 'መዝሙር'];
    const sectionAverages = useMemo(() => {
        return sections
            .filter(s => selectedSection === 'All' || s === selectedSection)
            .map(section => {
                const sectionRecords = filteredHistory.filter(d => d.section === section);
                if (sectionRecords.length === 0) return { section, average: 0 };
                const secPresent = sectionRecords.reduce((acc, curr) => acc + (curr.present || 0), 0);
                const secTotal = sectionRecords.reduce((acc, curr) => acc + (curr.total || 0), 0);
                return { section, average: secTotal > 0 ? Math.round((secPresent / secTotal) * 100) : 0 };
            })
            .sort((a, b) => b.average - a.average);
    }, [filteredHistory, selectedSection]);

    // 4. Trend Data (Line Chart)
    const trendData = useMemo(() => {
        const uniqueDates = [...new Set(filteredHistory.map(d => d.date.split('T')[0]))].sort();
        return uniqueDates.map(date => {
            const dayRecords = filteredHistory.filter(d => d.date.startsWith(date));
            const p = dayRecords.reduce((acc, curr) => acc + (curr.present || 0), 0);
            const t = dayRecords.reduce((acc, curr) => acc + (curr.total || 0), 0);
            return { date: date.split('-').slice(1).join('/'), average: t > 0 ? Math.round((p / t) * 100) : 0 };
        });
    }, [filteredHistory]);

    // 5. Pie Chart Data: Percent of total present students by section
    const sectionColors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
    ];

    const pieChartData = useMemo(() => {
        const totalPresentGlobal = sections.reduce((acc, section) => {
            const sectionRecords = filteredHistory.filter(d => d.section === section);
            return acc + sectionRecords.reduce((sAcc, curr) => sAcc + (curr.present || 0), 0);
        }, 0);

        if (totalPresentGlobal === 0) return [];

        return sections.map((section, index) => {
            const sectionRecords = filteredHistory.filter(d => d.section === section);
            const sectionPresent = sectionRecords.reduce((acc, curr) => acc + (curr.present || 0), 0);
            return {
                name: section,
                value: sectionPresent,
                percent: totalPresentGlobal > 0 ? ((sectionPresent / totalPresentGlobal) * 100).toFixed(1) : 0,
                color: sectionColors[index % sectionColors.length]
            };
        }).filter(d => d.value > 0);
    }, [filteredHistory]);


    if (filteredHistory.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
                    <div className="flex items-center gap-2">
                        <EthiopianDatePicker value={startDate} onChange={setStartDate} className="!py-1" />
                        <span className="text-gray-400 font-bold">to</span>
                        <EthiopianDatePicker value={endDate} onChange={setEndDate} className="!py-1" />
                    </div>
                </div>
                <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                    <Activity className="text-gray-200 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900">No Data Records</h3>
                    <p className="text-gray-500">The attendance database is currently empty for the selected period.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-gray-500 font-medium">Tracking performance across all sections</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {isManager && (
                        <div className="relative">
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-blue-100 rounded-xl bg-white text-gray-700 font-semibold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="All">Global Overview</option>
                                {sections.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <EthiopianDatePicker value={startDate} onChange={setStartDate} className="!py-1 text-sm" />
                        <span className="text-gray-400 font-bold text-sm">to</span>
                        <EthiopianDatePicker value={endDate} onChange={setEndDate} className="!py-1 text-sm" />
                    </div>
                </div>
            </div>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100 flex items-center gap-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Attendance Rate</div>
                        <div className="text-3xl font-black text-gray-900">{overallAverage}%</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Leading Section</div>
                        <div className="text-2xl font-black text-gray-900">
                            {sectionAverages[0]?.average > 0 ? sectionAverages[0]?.section : '-'}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Recorded Sessions</div>
                        <div className="text-2xl font-black text-gray-900">{totalSessions} <span className="text-sm text-gray-400">Gubaes</span></div>
                    </div>
                </div>
            </div>

            {/* Performance Ranking and Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-premium border border-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-blue-500" /> Section Comparison (Presence Rate)
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectionAverages} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="average" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-premium border border-gray-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" /> Attendance Trends (Over Time)
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" domain={[0, 100]} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* New Distribution Pie Chart */}
            <div className="bg-white p-10 rounded-[50px] shadow-mega border border-gray-50">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Presence Distribution</h2>
                    <p className="text-gray-500 font-medium">Breakdown of total presence across all sections</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-10">
                    <div className="lg:col-span-2 h-[450px]">
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={160}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        stroke="none"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => [`${value} Present`, props.payload.name]}
                                        contentStyle={{ borderRadius: '20px' }}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No present records found for the selected range.
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100 space-y-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Section Comparison</div>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                            {pieChartData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-blue-600">{item.percent}%</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                This chart shows which sections contribute most to the total attendance volume during this period.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
