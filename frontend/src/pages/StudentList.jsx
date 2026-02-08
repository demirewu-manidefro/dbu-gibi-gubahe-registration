import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
    CheckCircle,
    GraduationCap,
    Key,
    ShieldCheck,
    ShieldAlert,
    RotateCcw
} from 'lucide-react';
import EditStudentModal from '../components/EditStudentModal';
import { toEthiopian } from '../utils/ethiopianDateUtils';

const StudentList = ({ mode = 'Student' }) => {
    const { students, user, updateStudent, deleteStudent, importStudents, resetPassword, approveStudent, makeStudentAdmin, makeSuperManager, globalSearch, setGlobalSearch } = useAuth();
    const [filterSection, setFilterSection] = useState('All');
    const isManager = user?.role === 'manager';
    const isStudent = user?.role === 'student';
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);

    const safeStudents = students || [];

    const normalizeStudent = (s) => {
        if (!s) return null;
        const parse = (val) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch (e) { return val; }
            }
            if (typeof val === 'object' && val !== null) return val;
            return {};
        };

        let schoolInfo = parse(s.school_info || s.schoolInfo);
        let otherLanguages = parse(s.other_languages || s.otherLanguages);
        let teacherTrainingRaw = parse(s.teacher_training || s.teacherTraining || schoolInfo.teacher_training || schoolInfo.teacherTraining);
        let leadershipTrainingRaw = parse(s.leadership_training || s.leadershipTraining || schoolInfo.leadership_training || schoolInfo.leadershipTraining);

        const normalizeTraining = (t) => ({
            level1: t?.level1 || t?.['1'] || '',
            level2: t?.level2 || t?.['2'] || '',
            level3: t?.level3 || t?.['3'] || ''
        });

        let teacherTraining = normalizeTraining(teacherTrainingRaw);
        let leadershipTraining = normalizeTraining(leadershipTrainingRaw);

        let participation = parse(s.responsibility || s.participation || schoolInfo.responsibility || schoolInfo.participation);
        let attendance = parse(s.attendance || s.attendance_yearly || schoolInfo.attendance || schoolInfo.attendance_yearly);
        let educationYearlyRaw = parse(s.education_yearly || s.educationYearly || schoolInfo.education_yearly || schoolInfo.educationYearly);

        const normalizeYearly = (e) => ({
            y1: e?.y1 || e?.['1'] || '',
            y2: e?.y2 || e?.['2'] || '',
            y3: e?.y3 || e?.['3'] || '',
            y4: e?.y4 || e?.['4'] || '',
            y5: e?.y5 || e?.['5'] || '',
            y6: e?.y6 || e?.['6'] || ''
        });

        let educationYearly = normalizeYearly(educationYearlyRaw);
        let gpa = parse(s.gpa || schoolInfo.gpa || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' });
        let abinetEducation = s.abinet_education || s.abinetEducation || schoolInfo.abinetEducation || '';
        let specialNeed = s.special_need || s.specialNeed || schoolInfo.specialNeed || '';

        let birthYear = s.birthYear || s.birth_year;
        if (!birthYear && s.birth_date) {
            const date = new Date(s.birth_date);
            if (!isNaN(date.getTime())) {
                birthYear = date.getFullYear();
            } else {
                birthYear = s.birth_date;
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

            dept: s.department || s.dept,
            year: s.batch || s.year,
            graduationYear: s.graduation_year || s.graduationYear || schoolInfo.graduation_year || schoolInfo.graduationYear,
            cumulativeGPA: s.cumulative_gpa || s.cumulativeGPA || schoolInfo.cumulativeGPA,
            membershipYear: s.membership_year || s.membershipYear || schoolInfo.membershipYear,
            photoUrl: s.photo_url || s.photoUrl,
            traineeType: s.trainee_type || s.traineeType,
            gpa: gpa,
            participation: participation,
            responsibility: participation,
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


    const filteredStudents = isStudent
        ? [normalizeStudent(user)].filter(s => s && s.id)
        : safeStudents.map(s => normalizeStudent(s)).filter(student =>
            student &&
            student.status === mode && // Only show students for current mode
            (isManager ? (student.name || '').toUpperCase() !== 'N/A' : true) &&
            (isManager
                ? (filterSection === 'All' || student.section === filterSection)
                : (student.section === user?.section)
            ) &&
            ((student.name || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                (student.id || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                (student.dept || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                (String(student.graduationYear || '')).includes(globalSearch))
        ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

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

    const handleGraduate = async (student) => {
        if (!window.confirm(`Are you sure you want to mark ${student.name} as Graduated?`)) return;
        try {
            await updateStudent(student.id, { status: 'Graduated' });
            alert('Student marked as Graduated successfully!');
        } catch (err) {
            alert(err.message || 'Failed to update student status');
        }
    };

    const handleRestore = async (student) => {
        if (!window.confirm(`Are you sure you want to restore ${student.name} to the student list?`)) return;
        try {
            await updateStudent(student.id, { status: 'Student' });
            alert('Student restored successfully!');
        } catch (err) {
            alert(err.message || 'Failed to restore student');
        }
    };

    const [activeModal, setActiveModal] = useState(null);


    const excelHeaders = [
        'ተ.ቁ', 'የተማሪ መለያ', 'ሙሉ ስም', 'ጾታ', 'እድሜ', 'የልደት ዘመን', 'የክርስትና ስም', 'መንፈሳዊ ማዕረግ',
        'የአፍ መፍቻ ቋንቋ', 'ሌላ ቋንቋ 1', 'ሌላ ቋንቋ 2', 'ሌላ ቋንቋ 3',
        'ክልል', 'ዞን', 'ወረዳ', 'ቀበሌ', 'የተማሪ ስልክ',
        'የተጠሪ ስም', 'የተጠሪ ስልክ',
        'ማእከለ እና ወረዳ ማእከል', 'የግቢ ጉባኤው ስም',
        'አጥቢያ ቤተክርስቲያን', 'የአገልግሎት ክፍል',
        '1ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት', '2ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት', '3ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት',
        '4ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት', '5ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት', '6ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት',
        'የትምህርት ክፍል',
        '1ኛ ዓመት GPA', '2ኛ ዓመት GPA', '3ኛ ዓመት GPA',
        '4ኛ ዓመት GPA', '5ኛ ዓመት GPA', '6ኛ ዓመት GPA',
        'አጠቃላይ ውጤት (CGPA)', 'አባል የሆኑበት ዓመት', 'የሚመረቁበት ዓ/ም',
        '1ኛ ዓመት ክትትል', '2ኛ ዓመት ክትትል', '3ኛ ዓመት ክትትል',
        '4ኛ ዓመት ክትትል', '5ኛ ዓመት ክትትል', '6ኛ ዓመት ክትትል',
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

    const getStudentExcelData = (s, index, forExport = false) => {
        const q = (val) => forExport ? (val || '') : (val || '-');
        const r = (val) => val || (forExport ? '' : '-');

        const p = s.responsibility || s.participation || {};
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
            q(s.emergencyName),
            q(s.emergencyPhone),
            q(s.centerAndWoredaCenter),
            q(s.gibiName),
            q(s.parishChurch),
            q(s.section),
            q(p.y1), q(p.y2), q(p.y3), q(p.y4), q(p.y5), q(p.y6),

            q(s.dept || s.department),


            r(g.y1), r(g.y2), r(g.y3), r(g.y4), r(g.y5), r(g.y6),

            r(s.cumulativeGPA),
            r(s.membershipYear),
            r(s.graduationYear),


            q(att.y1), q(att.y2), q(att.y3), q(att.y4), q(att.y5), q(att.y6),

            q(edu.y1), q(edu.y2), q(edu.y3), q(edu.y4), q(edu.y5), q(edu.y6),

            q(s.teacherTraining?.level1), q(s.teacherTraining?.level2), q(s.teacherTraining?.level3),
            q(s.leadershipTraining?.level1), q(s.leadershipTraining?.level2), q(s.leadershipTraining?.level3),
            q(s.otherTrainings),
            q(s.abinetEducation),
            q(s.specialNeed),
            q(s.additionalInfo),
            q(s.filledBy),
            q(s.verifiedBy),
            q(formatEthDate(s.submissionDate))
        ];
    };

    const formatEthDate = (dateVal) => {
        if (!dateVal) return '-';
        try {
            const date = new Date(dateVal);
            if (isNaN(date.getTime())) return dateVal; // Return original if not a valid date
            const eth = toEthiopian(date);
            return `${eth.day}/${eth.month}/${eth.year}`;
        } catch (e) {
            return dateVal;
        }
    };


    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Students');

        const headerRow = worksheet.addRow(excelHeaders);


        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF9A9B9D' }
            };
            cell.font = {
                bold: true,
                color: { argb: 'black' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });


        filteredStudents.forEach((s, index) => {
            const rowData = getStudentExcelData(s, index, true);
            const row = worksheet.addRow(rowData);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        worksheet.columns.forEach((column) => {
            column.width = 18;
        });


        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `student_list_${new Date().toLocaleDateString()}.xlsx`);
    };

    const handleImport = () => {
        document.getElementById('file-upload').click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const workbook = new ExcelJS.Workbook();
            const arrayBuffer = await file.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet(1);

            const rows = [];
            worksheet.eachRow({ includeEmpty: true }, (row) => {
                const rowValues = [];
                for (let i = 1; i <= worksheet.columnCount; i++) {
                    const cell = row.getCell(i);
                    rowValues.push(cell.text ? cell.text.trim() : '');
                }
                rows.push(rowValues);
            });

            if (rows.length < 2) {
                alert('File is empty or has no data rows');
                return;
            }

            const headers = rows[0].map(h => h.toString().trim().toLowerCase());

            const headerMap = {
                'ተ.ቁ': 'index',
                'የተማሪ መለያ': 'id',
                'student id': 'id',
                'id': 'id',
                'ሙሉ ስም': 'name',
                'full name': 'name',
                'fullname': 'name',
                'ጾታ': 'sex',
                'sex': 'sex',
                'gender': 'sex',
                'እድሜ': 'age',
                'age': 'age',
                'የልደት ዘመን': 'birthYear',
                'birth year': 'birthYear',
                'የክርስትና ስም': 'baptismalName',
                'baptismal name': 'baptismalName',
                'መንፈሳዊ ማዕረግ': 'priesthoodRank',
                'priesthood rank': 'priesthoodRank',
                'የአፍ መፍቻ ቋንቋ': 'motherTongue',
                'mother tongue': 'motherTongue',
                'ሌላ ቋንቋ 1': 'l1',
                'ሌላ ቋንቋ 2': 'l2',
                'ሌላ ቋንቋ 3': 'l3',
                'ክልል': 'region',
                'region': 'region',
                'ዞን': 'zone',
                'zone': 'zone',
                'ወረዳ': 'woreda',
                'woreda': 'woreda',
                'ቀበሌ': 'kebele',
                'kebele': 'kebele',
                'የተማሪ ስልክ': 'phone',
                'phone': 'phone',
                'ማእከለ እና ወረዳ ማእከል': 'centerAndWoredaCenter',
                'ማእከል': 'centerAndWoredaCenter',
                'center': 'centerAndWoredaCenter',
                'woreda center': 'centerAndWoredaCenter',
                'የግቢ ጉባኤው ስም': 'gibiName',
                'የግቢ ጉባኤ ስም': 'gibiName',
                'የግቢ ጉባኤ': 'gibiName',
                'gibi name': 'gibiName',
                'campus ministry': 'gibiName',
                'የተጠሪ ስም': 'emergencyName',
                'emergency name': 'emergencyName',
                'የተጠሪ ስልክ': 'emergencyPhone',
                'emergency phone': 'emergencyPhone',
                'አጥቢያ ቤተክርስቲያን': 'parishChurch',
                'parish church': 'parishChurch',
                'የአገልግሎት ክፍል': 'section',
                'section': 'section',
                '1ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት': 'py1',
                '2ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት': 'py2',
                '3ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት': 'py3',
                '4ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት': 'py4',
                '5ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት': 'py5',
                '6ኛ ዓመት የአገልግሎት ክፍልና ሃላፊነት': 'py6',
                'የ1ኛ ዓመት ተሳትፎ': 'py1',
                'የ2ኛ ዓመት ተሳትፎ': 'py2',
                'የ3ኛ ዓመት ተሳትፎ': 'py3',
                'የ4ኛ ዓመት ተሳትፎ': 'py4',
                'የ5ኛ ዓመት ተሳትፎ': 'py5',
                'የ6ኛ ዓመት ተሳትፎ': 'py6',
                'የትምህርት ክፍል': 'dept',
                'department': 'dept',
                '1ኛ ዓመት gpa': 'gy1',
                '2ኛ ዓመት gpa': 'gy2',
                '3ኛ ዓመት gpa': 'gy3',
                '4ኛ ዓመት gpa': 'gy4',
                '5ኛ ዓመት gpa': 'gy5',
                '6ኛ ዓመት gpa': 'gy6',
                'አጠቃላይ ውጤት (cgpa)': 'cumulativeGPA',
                'cgpa': 'cumulativeGPA',
                'አባል የሆኑበት ዓመት': 'membershipYear',
                'membership year': 'membershipYear',
                'የሚመረቁበት ዓ/ም': 'graduationYear',
                'የምረቃ ዓመት': 'graduationYear',
                'graduation year': 'graduationYear',
                '1ኛ ዓመት ክትትል': 'ay1',
                '2ኛ ዓመት ክትትል': 'ay2',
                '3ኛ ዓመት ክትትል': 'ay3',
                '4ኛ ዓመት ክትትል': 'ay4',
                '5ኛ ዓመት ክትትል': 'ay5',
                '6ኛ ዓመት ክትትል': 'ay6',
                '1ኛ ዓመት ትምህርት': 'ey1',
                '2ኛ ዓመት ትምህርት': 'ey2',
                '3ኛ ዓመት ትምህርት': 'ey3',
                '4ኛ ዓመት ትምህርት': 'ey4',
                '5ኛ ዓመት ትምህርት': 'ey5',
                '6ኛ ዓመት ትምህርት': 'ey6',
                'የ1ኛ ዓመት ትምህርት': 'ey1',
                'የ2ኛ ዓመት ትምህርት': 'ey2',
                'የ3ኛ ዓመት ትምህርት': 'ey3',
                'የ4ኛ ዓመት ትምህርት': 'ey4',
                'የ5ኛ ዓመት ትምህርት': 'ey5',
                'የ6ኛ ዓመት ትምህርት': 'ey6',
                'spiritual education level': 'specialEducation',
                'መንፈሳዊ ትምህርት ደረጃ': 'specialEducation',
                'የመንፈሳዊ ትምህርት ደረጃ': 'specialEducation',
                'የመምህራን ስልጠና 1': 'tl1',
                'የመምህራን ስልጠና 2': 'tl2',
                'የመምህራን ስልጠና 3': 'tl3',
                'የአመራር ስልጠና 1': 'll1',
                'የአመራር ስልጠና 2': 'll2',
                'የአመራር ስልጠና 3': 'll3',
                'ሌሎች ስልጠናዎች': 'otherTrainings',
                'የአብነት ትምህርት': 'abinetEducation',
                'ልዩ ፍላጎት': 'specialNeed',
                'ተጨማሪ መረጃ': 'additionalInfo',
                'የመዘገበው አካል': 'filledBy',
                'ያረጋገጠው አካል': 'verifiedBy',
                'የተሰጠበት ቀን': 'submissionDate',
            };

            const parsedStudents = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i];
                if (values.every(v => v === '' || v === null)) continue;

                const rawData = {};
                headers.forEach((header, index) => {
                    const fieldName = headerMap[header.trim().toLowerCase()] || header;
                    let val = values[index] !== undefined && values[index] !== null ? String(values[index]).trim() : '';
                    // Remove leading/trailing double quotes if they exist
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.substring(1, val.length - 1);
                    }
                    rawData[fieldName] = val;
                });

                if (rawData.id || rawData.name) {
                    const student = {
                        id: rawData.id || `IMPORT-${Date.now()}-${i}`,
                        name: rawData.name,
                        sex: rawData.sex,
                        age: rawData.age,
                        birthYear: rawData.birthYear,
                        baptismalName: rawData.baptismalName,
                        priesthoodRank: rawData.priesthoodRank,
                        motherTongue: rawData.motherTongue,
                        otherLanguages: { l1: rawData.l1, l2: rawData.l2, l3: rawData.l3 },
                        region: rawData.region,
                        zone: rawData.zone,
                        woreda: rawData.woreda,
                        kebele: rawData.kebele,
                        phone: rawData.phone,
                        centerAndWoredaCenter: rawData.centerAndWoredaCenter,
                        gibiName: rawData.gibiName,
                        emergencyName: rawData.emergencyName,
                        emergencyPhone: rawData.emergencyPhone,
                        parishChurch: rawData.parishChurch,
                        section: rawData.section,
                        dept: rawData.dept,
                        cumulativeGPA: rawData.cumulativeGPA,
                        membershipYear: rawData.membershipYear,
                        graduationYear: rawData.graduationYear,
                        status: mode,
                        isGraduated: mode === 'Graduated',
                        responsibility: { y1: rawData.py1, y2: rawData.py2, y3: rawData.py3, y4: rawData.py4, y5: rawData.py5, y6: rawData.py6 },
                        gpa: { y1: rawData.gy1, y2: rawData.gy2, y3: rawData.gy3, y4: rawData.gy4, y5: rawData.gy5, y6: rawData.gy6 },
                        attendance: { y1: rawData.ay1, y2: rawData.ay2, y3: rawData.ay3, y4: rawData.ay4, y5: rawData.ay5, y6: rawData.ay6 },
                        educationYearly: { y1: rawData.ey1, y2: rawData.ey2, y3: rawData.ey3, y4: rawData.ey4, y5: rawData.ey5, y6: rawData.ey6 },
                        teacherTraining: { level1: rawData.tl1 === 'true' || rawData.tl1 === '1' || String(rawData.tl1).toLowerCase() === 'present', level2: rawData.tl2 === 'true' || rawData.tl2 === '1' || String(rawData.tl2).toLowerCase() === 'present', level3: rawData.tl3 === 'true' || rawData.tl3 === '1' || String(rawData.tl3).toLowerCase() === 'present' },
                        leadershipTraining: { level1: rawData.ll1 === 'true' || rawData.ll1 === '1' || String(rawData.ll1).toLowerCase() === 'present', level2: rawData.ll2 === 'true' || rawData.ll2 === '1' || String(rawData.ll2).toLowerCase() === 'present', level3: rawData.ll3 === 'true' || rawData.ll3 === '1' || String(rawData.ll3).toLowerCase() === 'present' },
                        otherTrainings: rawData.otherTrainings,
                        abinetEducation: rawData.abinetEducation,
                        specialNeed: rawData.specialNeed,
                        specialEducation: rawData.specialEducation,
                        additionalInfo: rawData.additionalInfo,
                        filledBy: rawData.filledBy || (user?.name || 'Import'),
                        verifiedBy: mode === 'Student' ? (user?.name || rawData.verifiedBy) : rawData.verifiedBy
                    };

                    if (user?.role === 'admin') {
                        student.section = user.section;
                    }

                    parsedStudents.push(student);
                }
            }

            if (parsedStudents.length === 0) {
                alert('No valid students found in the file');
                return;
            }

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

            e.target.value = '';
        } catch (error) {
            console.error('Import error:', error);
            alert('Error parsing the file. Please ensure it is a valid .xlsx file.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {isStudent ? 'የግል መረጃ' : (mode === 'Graduated' ? 'ተመርቀው የወጡ አባላት' : 'የተማሪዎች ዝርዝር')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {isStudent ? 'የግል መረጃ ይመልከቱ' : (mode === 'Graduated' ? 'ሁሉንም ተመርቀው የወጡ የግቢ ጉባኤ አባላትን ያስተዳድሩ እና ይመልከቱ' : 'ሁሉንም የተመዘገቡ የግቢ ጉባኤ ተማሪዎችን ያስተዳድሩ እና ይመልከቱ')}
                    </p>
                </div>
            </div>

            <input type="file" id="file-upload" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />

            {!isStudent && (
                <div className="flex flex-wrap gap-3 pb-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all group"
                    >
                        <Download size={18} className="text-emerald-500 group-hover:text-emerald-600" />
                        <span>ወደ Excel ላክ</span>
                    </button>
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-all group"
                    >
                        <Upload size={18} className="text-blue-500 group-hover:text-blue-600" />
                        <span>መረጃ አስገባ</span>
                    </button>
                </div>
            )}

            {activeModal?.startsWith('password-') && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Key size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">የይለፍ ቃል ቀይር</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            የተማሪውን የይለፍ ቃል ቀይር:
                        </p>
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mb-6">
                            <div className="font-bold text-gray-900 dark:text-white">{safeStudents.find(s => s.id === activeModal.replace('password-', ''))?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">{activeModal.replace('password-', '')}</div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                ሰርዝ
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
                                ቀይር
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
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                            <div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">የተማሪ መረጃ</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{selectedStudent.id}</div>
                            </div>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            {/* Header Section with Photo */}
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 overflow-hidden flex-shrink-0">
                                    {selectedStudent.photoUrl ? (
                                        <img src={selectedStudent.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                                            {selectedStudent.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                                    <div className="text-base text-gray-500 dark:text-gray-400 font-medium">{selectedStudent.id}</div>
                                    {selectedStudent.username && ['admin', 'manager'].includes(user?.role) && (
                                        <div className="text-sm text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded w-fit my-1">
                                            @{selectedStudent.username}
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {selectedStudent.sex}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {selectedStudent.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-blue-500">#</span> የግል መረጃ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">እድሜ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.age || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የልደት ዘመን</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{selectedStudent.birthYear || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የአፍ መፍቻ ቋንቋ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.motherTongue || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ሌሎች ቋንቋዎች</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">
                                                {[
                                                    selectedStudent.otherLanguages?.l1,
                                                    selectedStudent.otherLanguages?.l2,
                                                    selectedStudent.otherLanguages?.l3
                                                ].filter(Boolean).join(', ') || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Spiritual Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-purple-500">†</span> መንፈሳዊ መረጃ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div className="col-span-2">
                                            <div className="text-xs text-gray-400 font-bold uppercase">የክርስትና ስም</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.baptismalName || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">መንፈሳዊ ማዕረግ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{getPriesthoodLabel(selectedStudent.priesthoodRank) || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የአገልግሎት ክፍል</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.section || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address & Contact */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-emerald-500">@</span> አድራሻ እና እውቅያ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ስልክ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.phone || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ክልል</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.region || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ዞን</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.zone || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ወረዳ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.woreda || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ቀበሌ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.kebele || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">ማእከል</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.centerAndWoredaCenter || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gibi & Emergency */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-orange-500">⚠</span> አደጋ ጊዜ እና ግቢ
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የግቢ ስም</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.gibiName || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">አጥቢያ ቤተክርስቲያን</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.parishChurch || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የተጠሪ ስም</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.emergencyName || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የተጠሪ ስልክ</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.emergencyPhone || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Education */}
                                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-blue-600">🎓</span> ትምህርት
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የትምህርት ክፍል</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.dept || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የምረቃ ዓመት / ባች</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.year || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">የሚመረቁበት ዓመት</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.graduationYear || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">አባል የሆኑበት ዓመት</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.membershipYear || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase">አጠቃላይ ውጤት (GPA)</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-200">{selectedStudent.cumulativeGPA || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Yearly Matrix */}
                                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-indigo-500">📊</span> ዓመታዊ መዛግብት
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left border border-gray-200 dark:border-slate-600 rounded-lg">
                                            <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-bold text-xs uppercase">
                                                <tr>
                                                    <th className="px-3 py-2 border-r border-b dark:border-slate-600">ዓመት</th>
                                                    <th className="px-3 py-2 border-r border-b dark:border-slate-600">GPA</th>
                                                    <th className="px-3 py-2 border-r border-b dark:border-slate-600">የአገልግሎት ክፍልና ሃላፊነት</th>
                                                    <th className="px-3 py-2 border-r border-b dark:border-slate-600">ክትትል</th>
                                                    <th className="px-3 py-2 border-b dark:border-slate-600">ትምህርት</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                                {[1, 2, 3, 4, 5, 6].map(year => (
                                                    <tr key={year} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                                                        <td className="px-3 py-2 border-r dark:border-slate-600 font-medium text-gray-500 dark:text-gray-300">Year {year}</td>
                                                        <td className="px-3 py-2 border-r dark:border-slate-600 text-gray-700 dark:text-gray-300">{selectedStudent.gpa?.[`y${year}`] || '-'}</td>
                                                        <td className="px-3 py-2 border-r dark:border-slate-600 text-gray-700 dark:text-gray-300">{(selectedStudent.responsibility?.[`y${year}`]) || (selectedStudent.participation?.[`y${year}`]) || '-'}</td>
                                                        <td className="px-3 py-2 border-r dark:border-slate-600 text-gray-700 dark:text-gray-300">{selectedStudent.attendance?.[`y${year}`] || '-'}</td>
                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{selectedStudent.educationYearly?.[`y${year}`] || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Trainings */}
                                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                        <span className="text-rose-500">🎖</span> ስልጠናዎች እና ሌሎች
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2">
                                            <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">የመምህር ስልጠና</div>
                                            <div className="space-y-1.5 mt-2">
                                                <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                                    <span className="text-gray-500 dark:text-gray-400">ደረጃ 1</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{selectedStudent.teacherTraining?.level1 || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                                    <span className="text-gray-500 dark:text-gray-400">ደረጃ 2</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{selectedStudent.teacherTraining?.level2 || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">ደረጃ 3</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{selectedStudent.teacherTraining?.level3 || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2">
                                            <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">የአመራር ስልጠና</div>
                                            <div className="space-y-1.5 mt-2">
                                                <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                                    <span className="text-gray-500 dark:text-gray-400">ደረጃ 1</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{selectedStudent.leadershipTraining?.level1 || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                                    <span className="text-gray-500 dark:text-gray-400">ደረጃ 2</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{selectedStudent.leadershipTraining?.level2 || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">ደረጃ 3</span>
                                                    <span className="font-bold text-gray-700 dark:text-gray-200">{selectedStudent.leadershipTraining?.level3 || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Other Trainings</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{selectedStudent.otherTrainings || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Abinet Education</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{selectedStudent.abinetEducation || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Special Need</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{selectedStudent.specialNeed || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Additional Info</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{selectedStudent.additionalInfo || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 border-t border-gray-100 pt-4 flex flex-wrap gap-8 text-xs text-gray-400">
                                    <div>
                                        <span className="font-bold uppercase mr-2">Filled By:</span>
                                        {selectedStudent.filledBy || '-'}
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase mr-2">Verified By:</span>
                                        {selectedStudent.verifiedBy || '-'}
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase mr-2">Submission Date:</span>
                                        {formatEthDate(selectedStudent.submissionDate)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-premium border border-gray-100 dark:border-slate-700 overflow-hidden">
                {!isStudent && (
                    <div className="p-4 sm:p-6 border-b border-gray-50 dark:border-slate-700 space-y-3 sm:space-y-4">
                        <div className="relative w-full">
                            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by ID, Name..."
                                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 h-11 sm:h-12 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full shadow-sm text-sm sm:text-base text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                        </div>

                        {isManager && (
                            <div className="flex flex-wrap gap-2">
                                <select
                                    className="flex-1 min-w-[200px] bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
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
                                <tr className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                                    {excelHeaders.map((h, i) => (
                                        <th key={i} className="px-4 py-3 border-r border-gray-200 dark:border-slate-700 whitespace-nowrap min-w-[150px]">{h}</th>
                                    ))}
                                    {!isStudent && (
                                        <th className="px-4 py-3 border-r border-gray-200 dark:border-slate-700 whitespace-nowrap min-w-[100px] text-center">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {filteredStudents.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        {getStudentExcelData(student, idx, false).map((val, i) => (
                                            <td key={i} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-slate-700 whitespace-nowrap">
                                                {val}
                                            </td>
                                        ))}
                                        {!isStudent && (
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-slate-700 whitespace-nowrap text-right">
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
                                                    {mode === 'Student' && (
                                                        <button
                                                            onClick={() => handleGraduate(student)}
                                                            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                                                            title="Mark as Graduated"
                                                        >
                                                            <GraduationCap size={18} />
                                                        </button>
                                                    )}
                                                    {mode === 'Graduated' && (
                                                        <div className="flex items-center gap-2 mr-2">
                                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg whitespace-nowrap">
                                                                {student.graduationYear || 'N/A'} ዓ.ም ተመራቂ
                                                            </span>
                                                            <button
                                                                onClick={() => handleRestore(student)}
                                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                                title="Restore to Student List"
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => openView(student)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {mode === 'Student' && (
                                                        <>
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
                                                            {!isStudent && isManager && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm(`Are you sure you want to promote ${student.name} to Super Manager? This will give them full access to everything.`)) {
                                                                            try {
                                                                                await makeSuperManager(student.id);
                                                                                alert('Student promoted to Super Manager successfully');
                                                                            } catch (err) {
                                                                                alert(err.message);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                                    title="Promote to Super Manager"
                                                                >
                                                                    <ShieldAlert size={16} />
                                                                </button>
                                                            )}
                                                        </>
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
                    <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-50 dark:border-slate-700 flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Showing <span className="text-gray-900 dark:text-white font-bold">{filteredStudents.length}</span> of <span className="text-gray-900 dark:text-white font-bold">{
                                safeStudents.filter(s =>
                                    s.status === mode &&
                                    (isManager ? (s.full_name || s.name || '').toUpperCase() !== 'N/A' : true) &&
                                    (isManager ? true : s.service_section === user?.section)
                                ).length
                            }</span> {mode === 'Graduated' ? 'graduates' : 'students'}
                        </div>

                    </div>
                )}
            </div>
        </div >
    );
};

export default StudentList;
