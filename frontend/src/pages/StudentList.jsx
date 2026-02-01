import React, { useState } from 'react';
import { useAuth } from '../context/auth';
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
    Key,
    CheckCircle,
    ShieldCheck
} from 'lucide-react';
import EditStudentModal from '../components/EditStudentModal';

const StudentList = () => {
    const { students, user, updateStudent, deleteStudent, importStudents, resetPassword, approveStudent, makeStudentAdmin, globalSearch, setGlobalSearch } = useAuth();
    const [filterSection, setFilterSection] = useState('All');
    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const safeStudents = students || [];

    const normalizeStudent = (s) => {
        if (!s) return null;

        // Helper to parse potential JSON strings
        const parse = (val) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch (e) { return val; }
            }
            if (typeof val === 'object' && val !== null) return val;
            return {};
        };

        let schoolInfo = parse(s.school_info || s.schoolInfo);
        let otherLanguages = parse(s.other_languages || s.otherLanguages);
        let teacherTraining = parse(s.teacher_training || s.teacherTraining);
        let leadershipTraining = parse(s.leadership_training || s.leadershipTraining);
        let participation = parse(s.participation || schoolInfo.participation);
        let attendance = parse(s.attendance || schoolInfo.attendance);
        let educationYearly = parse(s.educationYearly || schoolInfo.educationYearly);
        let gpa = s.gpa || schoolInfo.gpa || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' };
        let abinetEducation = s.abinet_education || s.abinetEducation || schoolInfo.abinetEducation || '';
        let specialNeed = s.special_need || s.specialNeed || schoolInfo.specialNeed || '';

        // Handle birthYear extraction from birth_date if needed
        let birthYear = s.birthYear || s.birth_year;
        if (!birthYear && s.birth_date) {
            const date = new Date(s.birth_date);
            if (!isNaN(date.getTime())) {
                birthYear = date.getFullYear();
            } else {
                birthYear = s.birth_date; // fallback if it's already a year string
            }
        }

        return {
            ...s,
            id: s.id || s.student_id || s.studentId,
            name: s.full_name || s.fullName || s.name,
            sex: s.gender || s.sex,
            age: s.age,
            birthYear: birthYear,
            baptismalName: s.baptismal_name || s.baptismalName,
            priesthoodRank: s.priesthood_rank || s.priesthoodRank,
            motherTongue: s.mother_tongue || s.motherTongue,
            otherLanguages: otherLanguages,
            region: s.region,
            zone: s.zone,
            woreda: s.woreda,
            kebele: s.kebele,
            phone: s.phone,
            centerAndWoredaCenter: s.center_and_woreda || s.centerAndWoredaCenter,
            gibiName: s.gibi_name || s.gibiName,
            emergencyName: s.emergency_name || s.emergencyName,
            emergencyPhone: s.emergency_phone || s.emergencyPhone,
            parishChurch: s.parish_church || s.parishChurch,
            section: s.service_section || s.section,
            specialEducation: s.special_education || s.specialEducation || schoolInfo.specialEducation,
            specialPlace: s.special_place || s.specialPlace || schoolInfo.specialPlace,
            dept: s.department || s.dept,
            year: s.batch || s.year,
            graduationYear: s.graduation_year || s.graduationYear,
            cumulativeGPA: s.cumulative_gpa || s.cumulativeGPA || schoolInfo.cumulativeGPA,
            membershipYear: s.membership_year || s.membershipYear,
            photoUrl: s.photo_url || s.photoUrl,
            traineeType: s.trainee_type || s.traineeType,
            gpa: gpa,
            participation: participation,
            teacherTraining: teacherTraining,
            leadershipTraining: leadershipTraining,
            otherTrainings: s.other_trainings || s.otherTrainings,
            additionalInfo: s.additional_info || s.additionalInfo,
            filledBy: s.filled_by || s.filledBy,
            verifiedBy: s.verified_by || s.verifiedBy,
            submissionDate: s.created_at || s.submissionDate,
            attendance: attendance,
            educationYearly: educationYearly,
            abinetEducation: abinetEducation,
            specialNeed: specialNeed,
        };
    };

    // For students: show only their own data
    // For admins/managers: show only approved students (status === 'Student'), not pending
    const filteredStudents = isStudent
        ? [normalizeStudent(user)].filter(s => s && s.id)
        : safeStudents.map(s => normalizeStudent(s)).filter(student =>
            student &&
            student.status === 'Student' && // Only show approved students
            (isManager ? (student.name || '').toUpperCase() !== 'N/A' : true) &&
            (isManager
                ? (filterSection === 'All' || student.section === filterSection)
                : (student.section === user?.section)
            ) &&
            ((student.name || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                (student.id || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                (student.dept || '').toLowerCase().includes(globalSearch.toLowerCase()))
        );

    const openView = (student) => {
        setSelectedStudent(student);
        setIsViewing(true);
        setIsEditing(false);
    };

    const openEdit = (student) => {
        setSelectedStudent(student);
        setIsEditing(true);
        setIsViewing(false);
    };

    const closeModal = () => {
        setSelectedStudent(null);
        setIsEditing(false);
        setIsViewing(false);
    };

    const handleSave = (updatedData) => {
        // Data is already saved by EditStudentModal
        closeModal();
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
        try {
            await deleteStudent(studentId);
            alert('Student deleted successfully!');
        } catch (err) {
            alert(err.message || 'Failed to delete student');
        }
    };

    const [activeModal, setActiveModal] = useState(null);


    const csvHeaders = [
        'ተ.ቁ', 'የተማሪ መለያ', 'ሙሉ ስም', 'ጾታ', 'እድሜ', 'የልደት ዘመን', 'የክርስትና ስም', 'መንፈሳዊ ማዕረግ',
        'የአፍ መፍቻ ቋንቋ', 'ሌላ ቋንቋ 1', 'ሌላ ቋንቋ 2', 'ሌላ ቋንቋ 3',
        'ክልል', 'ዞን', 'ወረዳ', 'ቀበሌ', 'የተማሪ ስልክ',
        'ማእከለ እና ወረዳ ማእከል', 'የግቢ ጉባኤው ስም',
        'የተጠሪ ስም', 'የተጠሪ ስልክ',
        'አጥቢያ ቤተክርስቲያን', 'የአገልግሎት ክፍል', 'መንፈሳዊ ትምህርት ደረጃ', 'ልዩ ተሰጥኦ (CET)',
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
        const labels = { 'mimen': 'ምእመን', 'diakon': 'ዲያቆን', 'kahin': 'ካህን' };
        return labels[rank] || rank || '';
    };

    const getSexLabel = (sex) => {
        if (!sex) return '';
        const s = sex.toLowerCase();
        if (s.startsWith('m')) return 'M';
        if (s.startsWith('f')) return 'F';
        return sex;
    };

    const getStudentCSVData = (s, index, forExport = false) => {
        const q = (val) => forExport ? `"${val || ''}"` : (val || '-'); // Quote for CSV, Dash for UI
        const r = (val) => val || (forExport ? '' : '-'); // Raw for CSV, Dash for UI

        const p = s.participation || {}; // Safe access
        const g = s.gpa || {};
        const att = s.attendance || {};
        const edu = s.educationYearly || {};

        return [
            index + 1,
            forExport ? q(s.id) : s.id,
            forExport ? q(s.name || s.fullName) : (s.name || s.fullName),
            getSexLabel(s.sex),
            r(s.age),
            r(s.birthYear),
            q(s.baptismalName),
            q(getPriesthoodLabel(s.priesthoodRank)),
            q(s.motherTongue),
            q(s.otherLanguages?.l1),
            q(s.otherLanguages?.l2),
            q(s.otherLanguages?.l3),
            q(s.region),
            q(s.zone),
            q(s.woreda),
            q(s.kebele),
            q(s.phone),
            q(s.centerAndWoredaCenter),
            q(s.gibiName),
            q(s.emergencyName),
            q(s.emergencyPhone),
            q(s.parishChurch),
            q(s.section),
            q(s.specialEducation), // Menfesawi Timhirt
            q(s.specialPlace), // Special Talent (CET)

            // Participation (Indexes 25-30) - WAS MISSING
            q(p.y1), q(p.y2), q(p.y3), q(p.y4), q(p.y5), q(p.y6),

            q(s.dept || s.department),

            // GPA (Indexes 32-37)
            r(g.y1), r(g.y2), r(g.y3), r(g.y4), r(g.y5), r(g.y6),

            r(s.cumulativeGPA),
            r(s.membershipYear),
            r(s.graduationYear),

            // Follow Up (Indexes 41-46)
            q(att.y1), q(att.y2), q(att.y3), q(att.y4), q(att.y5), q(att.y6),

            q(s.photoUrl || s.photo_url),

            // Education (Indexes 48-53)
            q(edu.y1), q(edu.y2), q(edu.y3), q(edu.y4), q(edu.y5), q(edu.y6),

            q(s.teacherTraining?.level1), q(s.teacherTraining?.level2), q(s.teacherTraining?.level3),
            q(s.leadershipTraining?.level1), q(s.leadershipTraining?.level2), q(s.leadershipTraining?.level3),
            q(s.otherTrainings),
            q(s.abinetEducation),
            q(s.specialNeed),
            q(s.additionalInfo),
            q(s.filledBy),
            q(s.verifiedBy),
            q(s.submissionDate)
        ];
    };


    const handleExport = () => {
        const csvContent = [
            csvHeaders.join(','),
            ...filteredStudents.map((s, index) => getStudentCSVData(s, index, true).join(','))
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
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
                    'የተማሪ መለያ': 'id',

                    'name': 'name',
                    'full name': 'name',
                    'fullname': 'name',
                    'student name': 'name',
                    'ሙሉ ስም': 'name',

                    'sex': 'sex',
                    'gender': 'sex',
                    'ጾታ': 'sex',

                    'department': 'dept',
                    'dept': 'dept',
                    'የትምህርት ክፍል': 'dept',

                    'year': 'year',
                    'batch': 'year',

                    'section': 'section',
                    'የአገልግሎት ክፍል': 'section',

                    'status': 'status',

                    'phone': 'phone',
                    'telephone': 'phone',
                    'የተማሪ ስልክ': 'phone',

                    'center': 'centerAndWoredaCenter',
                    'woreda center': 'centerAndWoredaCenter',
                    'maekel': 'centerAndWoredaCenter',
                    'ማእከለ እና ወረዳ ማእከል': 'centerAndWoredaCenter',

                    'gibi': 'gibiName',
                    'gibi name': 'gibiName',
                    'gibigubae': 'gibiName',
                    'የግቢ ጉባኤው ስም': 'gibiName',

                    'parish': 'parishChurch',
                    'church': 'parishChurch',
                    'አጥቢያ ቤተክርስቲያን': 'parishChurch',

                    // Additional Amharic Mappings
                    'እድሜ': 'age',
                    'የልደት ዘመን': 'birthYear',
                    'የክርስትና ስም': 'baptismalName',
                    'መንፈሳዊ ማዕረግ': 'priesthoodRank',
                    'የአፍ መፍቻ ቋንቋ': 'motherTongue',
                    'ክልል': 'region',
                    'ዞን': 'zone',
                    'ወረዳ': 'woreda',
                    'ቀበሌ': 'kebele',
                    'የተጠሪ ስም': 'emergencyName',
                    'የተጠሪ ስልክ': 'emergencyPhone',
                    'መንፈሳዊ ትምህርት ደረጃ': 'specialEducation',
                    'ልዩ ተሰጥኦ (cet)': 'specialPlace',
                    'አጠቃላይ ውጤት (cgpa)': 'cumulativeGPA',
                    'አባል የሆኑበት ዓመት': 'membershipYear',
                    'የምረቃ ዓመት': 'graduationYear',
                    'ፎቶ': 'photoUrl',
                    'የአብነት ትምህርት': 'abinetEducation',
                    'ልዩ ፍላጎት': 'specialNeed',
                    'ተጨማሪ መረጃ': 'additionalInfo',
                    'የመዘገበው አካል': 'filledBy',
                    'ያረጋገጠው አካል': 'verifiedBy',
                    'የተሰጠበት ቀን': 'submissionDate'
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
                try {
                    const results = await importStudents(parsedStudents);
                    let msg = `Successfully imported ${results.success} student(s).`;
                    if (results.failed > 0) {
                        msg += `\nFailed to import ${results.failed} student(s). Check console or server logs for details.`;
                    }
                    alert(msg);
                } catch (err) {
                    alert(`Import failed: ${err.message}`);
                }

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

            {!isStudent && (
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
            )}

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
                                onClick={async () => {
                                    try {
                                        const message = await resetPassword(activeModal.replace('password-', ''));
                                        alert(message);
                                        setActiveModal(null);
                                    } catch (err) {
                                        alert(err.message || 'Failed to reset password');
                                    }
                                }}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - Full Registration Form */}
            {isEditing && selectedStudent && (
                <EditStudentModal
                    student={selectedStudent}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            {/* View Modal - Quick View */}
            {isViewing && selectedStudent && (
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
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsViewing(false);
                                    openEdit(selectedStudent);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                            >
                                <Edit size={16} /> Edit
                            </button>
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
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
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
                                    <option value="መዝሙር">መዝሙር</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <div className="overflow-x-auto pb-4">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200 text-gray-800 text-xs font-extrabold uppercase tracking-widest border-b-2 border-gray-300">
                                    {csvHeaders.map((h, i) => (
                                        <th key={i} className="px-4 py-3 border-r border-gray-200 whitespace-nowrap min-w-[150px]">{h}</th>
                                    ))}
                                    {!isStudent && (
                                        <th className="px-4 py-3 border-r border-gray-200 whitespace-nowrap min-w-[100px] text-center">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredStudents.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        {getStudentCSVData(student, idx, false).map((val, i) => (
                                            <td key={i} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 whitespace-nowrap">
                                                {csvHeaders[i] === 'ፎቶ' && val && val !== '-' ? (
                                                    <img src={val} alt="Student" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    val
                                                )}
                                            </td>
                                        ))}
                                        {!isStudent && (
                                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {user?.role === 'admin' && student.status === 'Pending' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to approve ${student.name}?`)) {
                                                                    approveStudent(student.id);
                                                                }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Approve Student"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
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
                                                    {!isStudent && isManager && (
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Are you sure you want to promote ${student.name} to Admin?`)) {
                                                                    try {
                                                                        await makeStudentAdmin(student.id);
                                                                        alert('Student promoted to Admin successfully');
                                                                    } catch (err) {
                                                                        alert(err.message);
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                                            title="Promote to Admin"
                                                        >
                                                            <ShieldCheck size={16} />
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
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
