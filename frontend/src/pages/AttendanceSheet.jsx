import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useNotifications } from '../context/NotificationContext';
import { createNotificationMessage } from '../utils/notificationHelpers';
import {
    Save,
    Search,
    Filter,
} from 'lucide-react';
import EthiopianDatePicker from '../components/EthiopianDatePicker';



const AttendanceSheet = () => {
    const { students, user, saveAttendanceBatch } = useAuth();
    const { addNotification } = useNotifications();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    const isManager = user?.role === 'manager';
    const [filterSection, setFilterSection] = useState(isManager ? 'All Sections' : user?.section);
    const studentsInSheet = students.filter(student =>
        student.status === 'Student' &&
        (filterSection === 'All Sections' || student.section === filterSection || student.service_section === filterSection)
    );

    const filteredStudents = studentsInSheet.filter(student =>
        (student.name || student.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = () => {
        const markedInSheet = studentsInSheet.filter(s => attendanceData[s.id]);
        const markedCount = markedInSheet.length;
        const totalCount = studentsInSheet.length;

        if (totalCount === 0) {
            alert('No students in this section!');
            return;
        }

        if (markedCount < totalCount) {
            const missing = studentsInSheet.filter(s => !attendanceData[s.id]);
            const missingNames = missing.slice(0, 3).map(s => s.name).join(', ');
            const suffix = missing.length > 3 ? ` and ${missing.length - 3} more...` : '';

            alert(`Please fill attendance for all students before saving.\nMissing: ${missingNames}${suffix}\n(${markedCount}/${totalCount} filled)`);
            return;
        }

        const dataToSave = {};
        studentsInSheet.forEach(s => {
            dataToSave[s.id] = attendanceData[s.id];
        });

        saveAttendanceBatch(selectedDate, dataToSave);

        // Send notification to manager
        const notif = createNotificationMessage.attendanceSaved(
            user?.name || user?.username,
            filterSection,
            totalCount
        );
        addNotification({ ...notif, from: user?.username });

        alert('Attendance saved successfully!');
    };


    const handleMarkAllPresent = () => {
        if (!window.confirm('Mark all UNMARKED students as present?')) return;
        const newData = { ...attendanceData };
        studentsInSheet.forEach(s => {
            if (!newData[s.id]) newData[s.id] = 'present';
        });
        setAttendanceData(newData);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'absent': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            case 'excused': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
            default: return 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'present': return 'ተገኝቷል';
            case 'absent': return 'ቀርቷል';
            case 'excused': return 'ፍቃድ';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">የክትትል ቅጽ</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">የተማሪዎችን የክስተቶች እና የአገልግሎት ክትትል ይከታተሉ</p>
                </div>
                <div className="flex gap-4">
                    <EthiopianDatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                    />
                    <button
                        onClick={handleSaveAttendance}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                    >
                        <Save size={18} />
                        ቅጹን አስቀምጥ
                    </button>
                </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-gray-100 dark:border-slate-700 flex items-center gap-6 shadow-sm">
                <div className="flex-1">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-white">የተጠናቀቀበት ሁኔታ</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                            {studentsInSheet.filter(s => attendanceData[s.id]).length} / {studentsInSheet.length} ተሞልቷል
                        </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-700 ease-out ${studentsInSheet.filter(s => attendanceData[s.id]).length === studentsInSheet.length ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-blue-500 animate-pulse'}`}
                            style={{ width: `${(studentsInSheet.filter(s => attendanceData[s.id]).length / (studentsInSheet.length || 1)) * 100}%` }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleMarkAllPresent}
                    className="px-4 py-2 border-2 border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                    ሁሉንም እንደተገኙ ምልክት አድርግ
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-premium dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="ተማሪ ይፈልጉ..."
                            className="pl-10 h-12 bg-gray-50/50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-700 rounded-2xl w-full text-gray-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            {isManager ? (
                                <select
                                    className="appearance-none pl-10 pr-8 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl font-bold text-gray-600 dark:text-white"
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                >
                                    <option value="All Sections">ሁሉም ክፍላት</option>
                                    <option value="እቅድ">እቅድ (Planning)</option>
                                    <option value="ትምህርት">ትምህርት (Education)</option>
                                    <option value="ልማት">ልማት (Development)</option>
                                    <option value="ባች">ባች (Batch)</option>
                                    <option value="ሙያ">ሙያ (Profession)</option>
                                    <option value="ቋንቋ">ቋንቋ (Language)</option>
                                    <option value="አባላት">አባላት (Members)</option>
                                    <option value="ኦዲት">ኦዲት (Audit)</option>
                                    <option value="ሂሳብ">ሂሳብ (Finance)</option>
                                    <option value="መዝሙር" className="dark:bg-slate-800">መዝሙር (Choir)</option>
                                </select>
                            ) : (
                                <div className="flex items-center gap-2 pl-4 pr-6 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl font-bold text-gray-600 dark:text-white">
                                    <span className="text-blue-400">●</span>
                                    {user?.section} Only
                                </div>
                            )}
                            {isManager && <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">ተማሪ</th>
                                <th className="px-8 py-4">ክፍላት</th>
                                <th className="px-8 py-4 text-center">ተገኝቷል</th>
                                <th className="px-8 py-4 text-center">ቀርቷል</th>
                                <th className="px-8 py-4 text-center">ፍቃድ</th>
                                <th className="px-8 py-4 text-center">ሁኔታ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{student.name}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">{student.id}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{student.section}</span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 dark:border-slate-500 dark:bg-slate-700"
                                                checked={attendanceData[student.id] === 'present'}
                                                onChange={() => handleAttendanceChange(student.id, 'present')}
                                            />
                                        </label>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300 dark:border-slate-500 dark:bg-slate-700"
                                                checked={attendanceData[student.id] === 'absent'}
                                                onChange={() => handleAttendanceChange(student.id, 'absent')}
                                            />
                                        </label>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-slate-500 dark:bg-slate-700"
                                                checked={attendanceData[student.id] === 'excused'}
                                                onChange={() => handleAttendanceChange(student.id, 'excused')}
                                            />
                                        </label>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        {attendanceData[student.id] && (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusColor(attendanceData[student.id])}`}>
                                                {getStatusLabel(attendanceData[student.id])}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span className="text-gray-900 dark:text-white font-bold">{filteredStudents.length}</span> ተማሪዎችን በማሳየት ላይ
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSheet;
