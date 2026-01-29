import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Download,
    Eye,
    Edit,
    Trash,
    ChevronLeft,
    ChevronRight,
    X,
    Save,
    Upload,
    Key
} from 'lucide-react';

const StudentList = () => {
    const { students, user, updateStudent, deleteStudent, importStudents } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSection, setFilterSection] = useState('All');
    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    const safeStudents = students || [];

    const filteredStudents = isStudent
        ? safeStudents.filter(s => s.username === user?.username || s.id === user?.id)
        : safeStudents.filter(student =>
            (isManager
                ? (filterSection === 'All' || student.section === filterSection)
                : student.section === user?.section
            ) &&
            ((student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.dept || '').toLowerCase().includes(searchTerm.toLowerCase()))
        );

    const openView = (student) => {
        setSelectedStudent(student);
        setIsEditing(false);
        setEditData(null);
    };

    const openEdit = (student) => {
        setSelectedStudent(student);
        setIsEditing(true);
        setEditData({
            name: student.name,
            dept: student.dept,
            year: student.year,
            section: student.section,
            status: student.status
        });
    };

    const closeModal = () => {
        setSelectedStudent(null);
        setIsEditing(false);
        setEditData(null);
    };

    const handleSave = () => {
        if (!selectedStudent || !editData) return;
        updateStudent(selectedStudent.id, editData);
        closeModal();
    };

    const handleDelete = (studentId) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        deleteStudent(studentId);
    };

    const [activeModal, setActiveModal] = useState(null);

    const handleExport = () => {
        const headers = [
            'ተ.ቁ', 'የተማሪ መለያ', 'ሙሉ ስም', 'ጾታ', 'እድሜ', 'የልደት ዘመን', 'የክርስትና ስም', 'መንፈሳዊ ማዕረግ',
            'የአፍ መፍቻ ቋንቋ', 'ሌላ ቋንቋ 1', 'ሌላ ቋንቋ 2', 'ሌላ ቋንቋ 3',
            'ክልል', 'ዞን', 'ወረዳ', 'ቀበሌ', 'የተማሪ ስልክ', 'የተጠሪ ስም', 'የተጠሪ ስልክ',
            'አጥቢያ ቤተክርስቲያን', 'መንፈሳዊ ትምህርት ደረጃ', 'ልዩ ተሰጥኦ (CET)',
            'የ1ኛ ዓመት ተሳትፎ', 'የ2ኛ ዓመት ተሳትፎ', 'የ3ኛ ዓመት ተሳትፎ',
            'የ4ኛ ዓመት ተሳትፎ', 'የ5ኛ ዓመት ተሳትፎ', 'የ6ኛ ዓመት ተሳትፎ',
            'የትምህርት ክፍል',
            '1ኛ ዓመት GPA', '2ኛ ዓመት GPA', '3ኛ ዓመት GPA',
            '4ኛ ዓመት GPA', '5ኛ ዓመት GPA', '6ኛ ዓመት GPA',
            'አጠቃላይ ውጤት (CGPA)', 'አባል የሆኑበት ዓመት', 'የምረቃ ዓመት',
            '1ኛ ዓመት ክትትል', '2ኛ ዓመት ክትትል', '3ኛ ዓመት ክትትል',
            '4ኛ ዓመት ክትትል', '5ኛ ዓመት ክትትል', '6ኛ ዓመት ክትትል',
            'ፎቶ',
            '1ኛ ዓመት ትምህርት', '2ኛ ዓመት ትምህርት', '3ኛ ዓመት ትምህርት',
            '4ኛ ዓመት ትምህርት', '5ኛ ዓመት ትምህርት', '6ኛ ዓመት ትምህርት',
            'የመምህራን ስልጠና 1', 'የመምህራን ስልጠና 2', 'የመምህራን ስልጠና 3',
            'የአመራር ስልጠና 1', 'የአመራር ስልጠና 2', 'የአመራር ስልጠና 3',
            'ሌሎች ስልጠናዎች', 'የአብነት ትምህርት', 'ልዩ ፍላጎት', 'ተጨማሪ መረጃ',
            'የመዘገበው አካል', 'ያረጋገጠው አካል', 'የተሰጠበት ቀን'
        ];

        const getPriesthoodLabel = (rank) => {
            const labels = { 'lay': 'ምእመን', 'diakon': 'ዲያቆን', 'kahin': 'ካህን' };
            return labels[rank] || rank || '';
        };

        const getSexLabel = (sex) => {
            if (!sex) return '';
            const s = sex.toLowerCase();
            if (s.startsWith('m')) return 'M';
            if (s.startsWith('f')) return 'F';
            return sex;
        };

        const csvContent = [
            headers.join(','),
            ...filteredStudents.map((s, index) => [
                index + 1,
                `"${s.id || ''}"`,
                `"${s.name || s.fullName || ''}"`,
                getSexLabel(s.sex),
                s.age || '',
                s.birthYear || '',
                `"${s.baptismalName || ''}"`,
                `"${getPriesthoodLabel(s.priesthoodRank)}"`,
                `"${s.motherTongue || ''}"`,
                `"${s.otherLanguages?.l1 || ''}"`,
                `"${s.otherLanguages?.l2 || ''}"`,
                `"${s.otherLanguages?.l3 || ''}"`,
                `"${s.region || ''}"`,
                `"${s.zone || ''}"`,
                `"${s.woreda || ''}"`,
                `"${s.kebele || ''}"`,
                `"${s.phone || ''}"`,
                `"${s.emergencyName || ''}"`,
                `"${s.emergencyPhone || ''}"`,
                `"${s.parishChurch || ''}"`,
                `"${s.specialEducation || ''}"`,
                `"${s.specialPlace || ''}"`,
                '', // Year_Responsibility_1 (Placeholder)
                '', // 2
                '', // 3
                '', // 4
                '', // 5
                '', // 6
                `"${s.dept || s.department || ''}"`,
                s.gpa?.y1 || '',
                s.gpa?.y2 || '',
                s.gpa?.y3 || '',
                s.gpa?.y4 || '',
                s.gpa?.y5 || '',
                s.gpa?.y6 || '',
                s.cumulativeGPA || '',
                s.membershipYear || '',
                s.graduationYear || '',
                '', // Follow-ups
                '', '', '', '', '',
                `"${s.photoUrl || ''}"`,
                `"${s.participation?.y1 || ''}"`,
                `"${s.participation?.y2 || ''}"`,
                `"${s.participation?.y3 || ''}"`,
                `"${s.participation?.y4 || ''}"`,
                `"${s.participation?.y5 || ''}"`,
                `"${s.participation?.y6 || ''}"`,
                `"${s.teacherTraining?.level1 || ''}"`,
                `"${s.teacherTraining?.level2 || ''}"`,
                `"${s.teacherTraining?.level3 || ''}"`,
                `"${s.leadershipTraining?.level1 || ''}"`,
                `"${s.leadershipTraining?.level2 || ''}"`,
                `"${s.leadershipTraining?.level3 || ''}"`,
                '', // other_Training
                `"${s.specialEducation || ''}"`, // Abnet_Course
                '', // Special_need
                `"${s.additionalInfo || ''}"`,
                `"${s.filledBy || ''}"`,
                `"${s.verifiedBy || ''}"`,
                `"${s.submissionDate || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `student_list_${new Date().toLocaleDateString()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImport = () => {
        document.getElementById('file-upload').click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length < 2) {
                    alert('CSV file is empty or has no data rows');
                    return;
                }

                // Parse headers (first line)
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

                // Map common header variations to our field names
                const headerMap = {
                    'id': 'id',
                    'student id': 'id',
                    'studentid': 'id',
                    'name': 'name',
                    'full name': 'name',
                    'fullname': 'name',
                    'student name': 'name',
                    'sex': 'sex',
                    'gender': 'sex',
                    'department': 'dept',
                    'dept': 'dept',
                    'year': 'year',
                    'batch': 'year',
                    'section': 'section',
                    'status': 'status',
                    'phone': 'phone',
                    'telephone': 'phone'
                };

                // Parse data rows
                const parsedStudents = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

                    if (values.length < 2) continue; // Skip empty rows

                    const student = {};
                    headers.forEach((header, index) => {
                        const fieldName = headerMap[header] || header;
                        student[fieldName] = values[index] || '';
                    });

                    // Ensure required fields
                    if (student.id || student.name) {
                        student.id = student.id || `IMPORT-${Date.now()}-${i}`;
                        student.status = student.status || 'Student';
                        parsedStudents.push(student);
                    }
                }

                if (parsedStudents.length === 0) {
                    alert('No valid students found in CSV');
                    return;
                }

                // Import students
                importStudents(parsedStudents);
                alert(`Successfully imported ${parsedStudents.length} student(s)!`);

                // Reset file input
                e.target.value = '';
            } catch (error) {
                console.error('Import error:', error);
                alert('Error parsing CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student List</h1>
                    <p className="text-gray-500 font-medium">Manage and view all registered Gibi Gubae students</p>
                </div>
            </div>

            <input type="file" id="file-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />

            <div className="flex flex-wrap gap-3 pb-4">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                    <Download size={18} className="text-emerald-500 group-hover:text-emerald-600" />
                    <span>Export CSV</span>
                </button>
                <button
                    onClick={handleImport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all group"
                >
                    <Upload size={18} className="text-blue-500 group-hover:text-blue-600" />
                    <span>Import Data</span>
                </button>
            </div>

            {activeModal?.startsWith('password-') && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Key size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Reset password for student:
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="font-bold text-gray-900">{safeStudents.find(s => s.id === activeModal.replace('password-', ''))?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{activeModal.replace('password-', '')}</div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert(`Password reset for ${activeModal.replace('password-', '')} (stub function)`);
                                    setActiveModal(null);
                                }}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedStudent && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <div className="text-lg font-bold text-gray-900">Student Details</div>
                                <div className="text-xs text-gray-500">{selectedStudent.id}</div>
                            </div>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                        <input
                                            className="mt-1 w-full bg-gray-50 border-gray-200 rounded-xl"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                                        <input
                                            className="mt-1 w-full bg-gray-50 border-gray-200 rounded-xl"
                                            value={editData.dept}
                                            onChange={(e) => setEditData({ ...editData, dept: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                                            <input
                                                className="mt-1 w-full bg-gray-50 border-gray-200 rounded-xl"
                                                value={editData.year}
                                                onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                            <select
                                                className="mt-1 w-full bg-gray-50 border-gray-200 rounded-xl"
                                                value={editData.status}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Graduated">Graduated</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
                                        <select
                                            className="mt-1 w-full bg-gray-50 border-gray-200 rounded-xl"
                                            value={editData.section}
                                            onChange={(e) => setEditData({ ...editData, section: e.target.value })}
                                        >
                                            <option value="እቅድ">እቅድ</option>
                                            <option value="ትምህርት">ትምህርት</option>
                                            <option value="ልማት">ልማት</option>
                                            <option value="ባች">ባች</option>
                                            <option value="ሙያ">ሙያ</option>
                                            <option value="ቋንቋ">ቋንቋ</option>
                                            <option value="አባላት">አባላት</option>
                                            <option value="ኦዲት">ኦዲት</option>
                                            <option value="ሂሳብ">ሂሳብ</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="text-xl font-bold text-gray-900">{selectedStudent.name}</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-bold">Academic</div>
                                            <div className="text-sm text-gray-600">Department: {selectedStudent.dept}</div>
                                            <div className="text-sm text-gray-600">Year: {selectedStudent.year}</div>
                                            <div className="text-sm text-gray-600">Status: {selectedStudent.status}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-bold">Contact</div>
                                            <div className="text-sm text-gray-600">Phone: {selectedStudent.phone || '-'}</div>
                                            <div className="text-sm text-gray-600">Region: {selectedStudent.region || '-'}</div>
                                            <div className="text-sm text-gray-600">Zone: {selectedStudent.zone || '-'}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold mt-2">Spiritual</div>
                                        <div className="text-sm text-gray-600">Section: {selectedStudent.section}</div>
                                        <div className="text-sm text-gray-600">
                                            Courses: {selectedStudent.courses ? (
                                                [
                                                    selectedStudent.courses.level1 && 'Level 1',
                                                    selectedStudent.courses.level2 && 'Level 2'
                                                ].filter(Boolean).join(', ') || 'None'
                                            ) : '-'}
                                        </div>
                                        <div className="text-sm text-gray-600">Graduation Year: {selectedStudent.graduationYear || '-'}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-bold"
                                >
                                    <Save size={16} /> Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => openEdit(selectedStudent)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                            )}
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
                {!isStudent && (
                    <div className="p-6 border-b border-gray-50 space-y-4">
                        <div className="relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by ID, Name..."
                                className="w-full pl-14 pr-6 h-12 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {isManager && (
                            <div className="flex flex-wrap gap-2">
                                <select
                                    className="bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                >
                                    <option value="All">ክፍላት: All</option>
                                    <option value="እቅድ">እቅድ</option>
                                    <option value="ትምህርት">ትምህርት</option>
                                    <option value="ልማት">ልማት</option>
                                    <option value="ባች">ባች</option>
                                    <option value="ሙያ">ሙያ</option>
                                    <option value="ቋንቋ">ቋንቋ</option>
                                    <option value="አባላት">አባላት</option>
                                    <option value="ኦዲት">ኦዲት</option>
                                    <option value="ሂሳብ">ሂሳብ</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Student Name & ID</th>
                                <th className="px-8 py-4">Department</th>
                                <th className="px-8 py-4">Year</th>
                                <th className="px-8 py-4">ክፍላት</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            {student.photoUrl ? (
                                                <img
                                                    src={student.photoUrl}
                                                    alt={student.name}
                                                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-gray-900">{student.name}</div>
                                                <div className="text-xs text-gray-400">{student.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-medium text-gray-600">{student.dept}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">
                                            {student.year || '-'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <span className="text-sm font-medium">{student.section}</span>
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${student.status === 'Student'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openView(student)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEdit(student)}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit Student"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {!isStudent && (
                                                <button
                                                    onClick={() => setActiveModal(`password-${student.id}`)}
                                                    className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <Key size={16} />
                                                </button>
                                            )}
                                            {!isStudent && (
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete Student"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!isStudent && (
                    <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{filteredStudents.length}</span> of <span className="text-gray-900 font-bold">{safeStudents.length}</span> students
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-400 disabled:opacity-50" disabled>
                                <ChevronLeft size={18} />
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md">1</button>
                            <button className="px-4 py-2 hover:bg-white text-gray-600 rounded-lg font-bold text-sm">2</button>
                            <button className="px-4 py-2 hover:bg-white text-gray-600 rounded-lg font-bold text-sm">3</button>
                            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-600">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentList;
