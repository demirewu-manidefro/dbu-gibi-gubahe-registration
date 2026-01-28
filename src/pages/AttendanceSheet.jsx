import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Save,
    Search,
    Filter,
} from 'lucide-react';
import EthiopianDatePicker from '../components/EthiopianDatePicker';

const AttendanceSheet = () => {
    const { students } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});
    const [filterSection, setFilterSection] = useState('All Sections');

    const filteredStudents = students.filter(student =>
        (filterSection === 'All Sections' || student.section === filterSection) &&
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = () => {
        
        console.log('Saving attendance for date:', selectedDate);
        console.log('Data:', attendanceData);
        alert('Attendance saved successfully!');
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Sheet</h1>
                    <p className="text-gray-500 font-medium">Track student attendance for events and services</p>
                </div>
                <div className="flex gap-4">
                    <EthiopianDatePicker 
                        value={selectedDate} 
                        onChange={setSelectedDate} 
                    />
                    <button 
                        onClick={handleSaveAttendance}
                        className="flex items-center gap-2 px-6 py-3 bg-church-red text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md"
                    >
                        <Save size={18} /> Save Sheet
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-2xl w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <select 
                                className="appearance-none pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-600"
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                            >
                                <option>All Sections</option>
                                <option>Choir</option>
                                <option>Education</option>
                                <option>Charity</option>
                                <option>Development</option>
                            </select>
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Student</th>
                                <th className="px-8 py-4">Section</th>
                                <th className="px-8 py-4 text-center">ተገኝቷል</th>
                                <th className="px-8 py-4 text-center">ቀርቷል</th>
                                <th className="px-8 py-4 text-center">ፍቃድ</th>
                                <th className="px-8 py-4 text-center">Status</th>
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
                        Showing <span className="text-gray-900 font-bold">{filteredStudents.length}</span> students
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceSheet;
