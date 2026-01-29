import React from 'react';
import { useAuth } from '../context/AuthContext';
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
import { TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import EthiopianDatePicker from '../components/EthiopianDatePicker';

const Analytics = () => {
    const { attendanceHistory, user } = useAuth();
    const isManager = user?.role === 'manager';
    const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

    // Filter History based on Selected Month/Year
    // selectedDate is "YYYY-MM-DD", we want to match by year and month
    const [selYear, selMonth] = selectedDate.split('-').map(Number);

    const filteredHistory = attendanceHistory.filter(d => {
        if (!d.date) return false;
        // Postgres DATE type usually comes as "YYYY-MM-DD..." or ISO
        const [dYear, dMonth] = d.date.split('T')[0].split('-').map(Number);
        return dYear === selYear && dMonth === selMonth;
    });

    // 1. Calculate Average Attendance per Section (Filtered Data)
    const sections = ['እቅድ', 'ትምህርት', 'ልማት', 'ባች', 'ሙያ', 'ቋንቋ', 'አባላት', 'ኦዲት', 'ሂሳብ', 'መዝሙር'];

    // 2. Prepare Data for "Average Attendance by Section" (Bar Chart)
    const sectionAverages = sections.map(section => {
        const sectionRecords = filteredHistory.filter(d => d.section === section);
        if (sectionRecords.length === 0) return { section, average: 0, students: 0 };

        const avg = sectionRecords.reduce((acc, curr) => acc + curr.percentage, 0) / sectionRecords.length;
        return {
            section,
            average: Math.round(avg),
            students: sectionRecords[sectionRecords.length - 1]?.total || 0
        };
    }).sort((a, b) => b.average - a.average);

    // 3. Prepare Data for "Attendance Trends" (Line Chart)
    const uniqueDates = [...new Set(filteredHistory.map(d => d.date.split('T')[0]))].sort();
    const trendData = uniqueDates.map(date => {
        const dayRecords = filteredHistory.filter(d => d.date.startsWith(date));
        const dayAvg = dayRecords.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / (dayRecords.length || 1);
        return {
            date: date.split('-').slice(1).join('/'), // MM/DD format
            average: Math.round(dayAvg)
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-gray-500 font-medium">Overview of student attendance and section performance</p>
                </div>
                <div>
                    <EthiopianDatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                    />
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Avg. Attendance</div>
                        <div className="text-2xl font-extrabold text-gray-900">
                            {sectionAverages.length > 0 ? Math.round(sectionAverages.reduce((acc, curr) => acc + curr.average, 0) / sectionAverages.length) : 0}%
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Highest Section</div>
                        <div className="text-2xl font-extrabold text-gray-900">
                            {sectionAverages[0]?.section || '-'}
                            <span className="text-xs text-green-600 font-bold ml-2">({sectionAverages[0]?.average}%)</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                        <PieChartIcon size={24} />
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Sessions</div>
                        <div className="text-2xl font-extrabold text-gray-900">
                            {uniqueDates.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart: Section Performance */}
                <div className="bg-white p-8 rounded-3xl shadow-premium border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Section Attendance Performance</h3>
                        <p className="text-sm text-gray-500">Average attendance percentage by section</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectionAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="section"
                                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="%"
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="average"
                                    name="Attendance"
                                    fill="#3b82f6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Line Chart: Overall Trend */}
                <div className="bg-white p-8 rounded-3xl shadow-premium border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Monthly Attendance Trend</h3>
                        <p className="text-sm text-gray-500">Daily average attendance trend for the selected month</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="%"
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="average"
                                    name="Average %"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Monthly Section Breakdown - Unified Pie Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-premium border border-gray-100">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Monthly Section Attendance Contribution</h3>
                        <p className="text-gray-500 font-medium">Breakdown of total attendance by section (This Month)</p>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={(() => {
                                    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#0ea5e9'];

                                    // Aggregate data for the pie chart using filteredHistory
                                    const pieData = sections.map((section, index) => {
                                        const sectionHistory = filteredHistory.filter(d => d.section === section);

                                        const totalPresent = sectionHistory.reduce((sum, d) => sum + (d.present || 0), 0);
                                        const totalStudents = sectionHistory.reduce((sum, d) => sum + (d.total || 0), 0);
                                        const rate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

                                        return {
                                            name: section,
                                            value: totalPresent,
                                            rate: rate,
                                            color: COLORS[index % COLORS.length]
                                        };
                                    }).filter(d => d.value > 0);

                                    return pieData;
                                })()}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={140}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, rate }) => `${name} (${rate}%)`}
                            >
                                {(() => {
                                    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#0ea5e9'];
                                    return sections.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ));
                                })()}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => [
                                    `${value} Students (Rate: ${props.payload.rate}%)`,
                                    name
                                ]}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default Analytics;
