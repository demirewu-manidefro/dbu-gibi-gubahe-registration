import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const StudentList = () => {
    const { students } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Database</h1>
                    <p className="text-gray-500 font-medium">Manage and view all registered Gibi Gubae students</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                    <Download size={18} className="text-church-red" /> Export to Excel
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID, Name, or Department..."
                            className="pl-10 h-12 bg-gray-50/50 border-gray-200 rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">
                            <Filter size={16} /> Filter
                        </button>
                        <select className="bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-gray-600 px-4">
                            <option>All Sections</option>
                            <option>Choir</option>
                            <option>Education</option>
                            <option>Charity</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Student Name & ID</th>
                                <th className="px-8 py-4">Department</th>
                                <th className="px-8 py-4">Year</th>
                                <th className="px-8 py-4">Service Section</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-400">{student.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-medium text-gray-600">{student.dept}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">
                                            {student.year}th Year
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-church-gold"></div>
                                            <span className="text-sm font-medium">{student.section}</span>
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${student.status === 'Active'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-gray-400 hover:text-church-red transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900 font-bold">{filteredStudents.length}</span> of <span className="text-gray-900 font-bold">{students.length}</span> students
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-400 disabled:opacity-50" disabled>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="px-4 py-2 bg-church-red text-white rounded-lg font-bold text-sm shadow-md">1</button>
                        <button className="px-4 py-2 hover:bg-white text-gray-600 rounded-lg font-bold text-sm">2</button>
                        <button className="px-4 py-2 hover:bg-white text-gray-600 rounded-lg font-bold text-sm">3</button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-600">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentList;
