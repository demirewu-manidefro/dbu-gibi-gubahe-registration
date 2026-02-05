import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useNotifications } from '../context/NotificationContext';
import { createNotificationMessage } from '../utils/notificationHelpers';
import {
    Calendar,
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

    // For admins, default to their section and disable changing. For manager, default to All.
    const isManager = user?.role === 'manager';
    const [filterSection, setFilterSection] = useState(isManager ? 'All Sections' : user?.section);

    // Only show approved students (status === 'Student'), not pending registrations
    // Base list of students who SHOULD be in the attendance sheet (by section)
    const studentsInSheet = students.filter(student =>
        student.status === 'Student' &&
        (filterSection === 'All Sections' || student.section === filterSection || student.service_section === filterSection)
    );

    // List of students currently visible (affected by search)
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

        // Only save data for the students in the current sheet context
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
            case 'present': return 'text-green-600 bg-green-50 border-green-200';
            case 'absent': return 'text-red-600 bg-red-50 border-red-200';
            case 'excused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-400 bg-gray-50 border-gray-200';
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">የክትትል ቅጽ</h1>
                    <p className="text-gray-500 font-medium">የተማሪዎችን የክስተቶች እና የአገልግሎት ክትትል ይከታተሉ</p>
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

            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-gray-100 flex items-center gap-6 shadow-sm">
                <div className="flex-1">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">የተጠናቀቀበት ሁኔታ</span>
                        <span className="text-sm font-black text-blue-600">
                            {studentsInSheet.filter(s => attendanceData[s.id]).length} / {studentsInSheet.length} ተሞልቷል
                        </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-700 ease-out ${studentsInSheet.filter(s => attendanceData[s.id]).length === studentsInSheet.length ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-blue-500 animate-pulse'}`}
                            style={{ width: `${(studentsInSheet.filter(s => attendanceData[s.id]).length / (studentsInSheet.length || 1)) * 100}%` }}
                        />
                    </div>
                </div>
                <button
                    onClick={handleMarkAllPresent}
                    className="px-4 py-2 border-2 border-green-100 text-green-600 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-green-50 transition-colors"
                >
                    ሁሉንም እንደተገኙ ምልክት አድርግ
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ተማሪ ይፈልጉ..."
                            className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-2xl w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            {isManager ? (
                                <select
                                    className="appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-600"
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
                                    <option value="መዝሙር">መዝሙር (Choir)</option>
                                </select>
                            ) : (
                                <div className="flex items-center gap-2 pl-4 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-600">
                                    <span className="text-blue-400">●</span>
                                    {user?.section} Only
                                </div>
                            )}
                            {isManager && <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">ተማሪ</th>
                                <th className="px-8 py-4">ክፍላት</th>
                                <th className="px-8 py-4 text-center">ተገኝቷል</th>
                                <th className="px-8 py-4 text-center">ቀርቷል</th>
                                <th className="px-8 py-4 text-center">ፍቃድ</th>
                                <th className="px-8 py-4 text-center">ሁኔታ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="font-bold text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-400">{student.id}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className="text-sm font-medium text-gray-600">{student.section}</span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-green-50 transition-colors">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
                                                checked={attendanceData[student.id] === 'present'}
                                                onChange={() => handleAttendanceChange(student.id, 'present')}
                                            />
                                        </label>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 transition-colors">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                                                checked={attendanceData[student.id] === 'absent'}
                                                onChange={() => handleAttendanceChange(student.id, 'absent')}
                                            />
                                        </label>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <label className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-yellow-50 transition-colors">
                                            <input
                                                type="radio"
                                                name={`attendance-${student.id}`}
                                                className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 border-gray-300"
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
                <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-500 font-medium">
                        <span className="text-gray-900 font-bold">{filteredStudents.length}</span> ተማሪዎችን በማሳየት ላይ
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSheet;
