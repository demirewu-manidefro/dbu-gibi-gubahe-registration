import React, { useState, useEffect } from 'react';
import {
    User,
    MapPin,
    GraduationCap,
    Church,
    Camera,
    Save,
    X,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth';
import { toEthiopian } from '../utils/ethiopianDateUtils';
import EthiopianDatePicker from './EthiopianDatePicker';

const ethiopianRegions = {
    "Afar Region": ["Awsiresu", "Kilberesu", "Gabi Rasu", "Fanti Rasu", "Hari Rasu"],
    "Amhara Region": ["Agew Awi Zone", "East Gojjam Zone", "West Gojjam Zone", "North Gojjam Zone", "North Gondar Zone", "South Gondar Zone", "Central Gondar Zone", "West Gondar Zone", "Wag Hemra Zone", "North Wollo Zone", "South Wollo Zone", "North Shewa Zone", "Oromia Zone", "Bahir Dar Special Zone", "Argobba Special Woreda"],
    "Benishangul-Gumuz Region": ["Asosa", "Kamashi", "Metekel", "Mao-Komo"],
    "Central Ethiopia Regional State": ["East Gurage", "Gurage", "Hadiya", "Halaba", "Kembata", "Silt'e", "Yem"],
    "Gambela Region": ["Anywaa Zone", "Majang Zone", "Nuer Zone"],
    "Harari Region": ["Harari"],
    "Oromia Region": ["Arsi", "West Arsi", "East Bale", "West Bale", "Borana", "East Borana", "East Guji", "West Guji", "East Hararghe", "West Hararghe", "East Shewa", "West Shewa", "North Shewa", "Southwest Shewa", "East Welega", "West Welega", "Horo Guduru Welega", "Illubabor", "Buno Bedele", "Jimma", "Kelam Welega"],
    "Sidama Region": ["Central Sidama Zone", "Eastern Sidama Zone", "Northern Sidama Zone", "Southern Sidama Zone", "Hawassa City Administration"],
    "Somali Region": ["Sitti", "Fafan", "Jarar", "Erer", "Nogob", "Dollo", "Korahe", "Shabelle", "Afder", "Liben", "Dhawa"],
    "South Ethiopia Regional State": ["Ale", "Ari", "Basketo", "Burji", "Gamo", "Gardula", "Gedeo", "Gofa", "Konso", "Koore", "South Omo", "Wolayita"],
    "South West Ethiopia Peoples' Region": ["Bench Sheko", "Dawro", "Keffa", "Sheka", "West Omo", "Konta"],
    "Tigray Region": ["Central Tigray", "East Tigray", "South-East Tigray", "South Tigray", "West Tigray", "North-West Tigray"],
    "Addis Ababa": ["Addis Ketema", "Akaki Kaliti", "Arada", "Bole", "Gulele", "Kerkos", "Kolfe Keraniyo", "Lideta", "Nifas Silk-Lafto", "Lemi Kura", "Yeka"],
    "Dire Dawa": ["Dire Dawa"]
};

const EditStudentModal = ({ student, onClose, onSave }) => {
    const { updateStudent, user } = useAuth();
    const currentEthYear = toEthiopian(new Date()).year;
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const getVal = (paths, defaultValue = '') => {
        for (const path of paths) {
            let current = student;
            const parts = path.split('.');
            for (const part of parts) {
                current = current ? current[part] : undefined;
            }
            if (current !== undefined && current !== null) return current;
        }
        return defaultValue;
    };

    const [formData, setFormData] = useState({
        // Tab 1: Basic Info
        studentId: getVal(['id', 'student_id']),
        fullName: getVal(['name', 'full_name']),
        sex: getVal(['sex', 'gender']),
        birthYear: getVal(['birthYear', 'birth_date']),
        age: getVal(['age']),
        baptismalName: getVal(['baptismalName', 'baptismal_name']),
        priesthoodRank: getVal(['priesthoodRank', 'priesthood_rank']),
        profilePhoto: null,
        photoUrl: getVal(['photoUrl', 'photo_url']),
        motherTongue: getVal(['motherTongue', 'mother_tongue']),
        otherLanguages: getVal(['otherLanguages', 'other_languages'], { l1: '', l2: '', l3: '' }),

        // Tab 2: Address
        phone: getVal(['phone']),
        region: getVal(['region']),
        zone: getVal(['zone']),
        woreda: getVal(['woreda']),
        kebele: getVal(['kebele']),
        gibiName: getVal(['gibiName', 'gibi_name']),
        centerAndWoredaCenter: getVal(['centerAndWoredaCenter', 'center_and_woreda']),
        parishChurch: getVal(['parishChurch', 'parish_church']),
        emergencyName: getVal(['emergencyName', 'emergency_name']),
        emergencyPhone: getVal(['emergencyPhone', 'emergency_phone']),

        // Tab 3: Academic
        department: getVal(['dept', 'department']),
        batch: getVal(['year', 'batch']),
        gpa: getVal(['gpa', 'school_info.gpa'], { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
        cumulativeGPA: getVal(['cumulativeGPA', 'school_info.cumulativeGPA']),

        // Tab 4: Spiritual
        serviceSection: getVal(['section', 'service_section']),
        graduationYear: getVal(['graduationYear', 'graduation_year']),
        membershipYear: getVal(['membershipYear', 'school_info.membershipYear']),
        specialEducation: getVal(['specialEducation', 'school_info.specialEducation']),
        specialPlace: getVal(['specialPlace', 'school_info.specialPlace']),
        participation: getVal(['participation', 'school_info.participation'], { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
        teacherTraining: getVal(['teacherTraining', 'teacher_training'], { level1: '', level2: '', level3: '' }),
        leadershipTraining: getVal(['leadershipTraining', 'leadership_training'], { level1: '', level2: '', level3: '' }),
        otherTrainings: getVal(['otherTrainings', 'other_trainings']),
        additionalInfo: getVal(['additionalInfo', 'additional_info']),
        filledBy: getVal(['filledBy', 'filled_by']),
        verifiedBy: getVal(['verifiedBy', 'verified_by']),
        submissionDate: getVal(['submissionDate', 'submission_date']),
        attendance: getVal(['attendance', 'school_info.attendance'], { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
        educationYearly: getVal(['educationYearly', 'school_info.educationYearly'], { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
        abinetEducation: getVal(['abinetEducation', 'school_info.abinetEducation']),
        specialNeed: getVal(['specialNeed', 'school_info.specialNeed']),
    });

    // Special handling for birthYear if it's a full ISO date string from DB
    useEffect(() => {
        if (formData.birthYear && typeof formData.birthYear === 'string' && formData.birthYear.includes('-')) {
            const year = formData.birthYear.split('-')[0];
            setFormData(prev => ({ ...prev, birthYear: year }));
        }
    }, []);

    // Also handle possible stringified JSON fields from DB
    useEffect(() => {
        const fieldsToJSON = [
            'otherLanguages', 'gpa', 'participation', 'teacherTraining',
            'leadershipTraining', 'attendance', 'educationYearly'
        ];

        setFormData(prev => {
            const updates = {};
            fieldsToJSON.forEach(field => {
                if (typeof prev[field] === 'string') {
                    try {
                        updates[field] = JSON.parse(prev[field]);
                    } catch (e) {
                        console.error(`Failed to parse ${field}`, e);
                    }
                }
            });
            return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
        });
    }, []);

    // Auto-calculate age
    useEffect(() => {
        const yearStr = String(formData.birthYear || '');
        if (yearStr.length === 4) {
            const year = parseInt(yearStr);
            const currentYear = toEthiopian(new Date()).year;
            setFormData(prev => ({ ...prev, age: currentYear - year }));
        }
    }, [formData.birthYear]);

    const tabs = [
        { id: 0, label: 'መሰረታዊ መረጃ', subLabel: 'መረጃ', icon: <User size={20} /> },
        { id: 1, label: 'አድራሻ', subLabel: 'መገኛ', icon: <MapPin size={20} /> },
        { id: 2, label: 'ትምህርት', subLabel: 'ትምህርት', icon: <GraduationCap size={20} /> },
        { id: 3, label: 'አገልግሎት', subLabel: 'መንፈሳዊ', icon: <Church size={20} /> },
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                courses: { ...prev.courses, [name]: checked }
            }));
        } else if (name.startsWith('gpa-')) {
            const year = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                gpa: { ...prev.gpa, [year]: value }
            }));
        } else if (name.startsWith('lang-')) {
            const key = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                otherLanguages: { ...prev.otherLanguages, [key]: value }
            }));
        } else if (name.startsWith('teacherTraining-')) {
            const level = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                teacherTraining: { ...prev.teacherTraining, [level]: value }
            }));
        } else if (name.startsWith('leadershipTraining-')) {
            const level = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                leadershipTraining: { ...prev.leadershipTraining, [level]: value }
            }));
        } else if (name.startsWith('participation-')) {
            const year = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                participation: { ...prev.participation, [year]: value }
            }));
        } else if (name.startsWith('attendance-')) {
            const year = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                attendance: { ...prev.attendance, [year]: value }
            }));
        } else if (name.startsWith('educationYearly-')) {
            const year = name.split('-')[1];
            setFormData(prev => ({
                ...prev,
                educationYearly: { ...prev.educationYearly, [year]: value }
            }));
        } else {
            if (name === 'region') {
                setFormData(prev => ({ ...prev, region: value, zone: '', woreda: '', kebele: '' }));
            } else if (name === 'zone') {
                setFormData(prev => ({ ...prev, zone: value, woreda: '', kebele: '' }));
            } else if (name === 'woreda') {
                setFormData(prev => ({ ...prev, woreda: value, kebele: '' }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Comprehensive Mandatory Field Validation
        const validationError = (msg, tab) => {
            setError(msg);
            setTimeout(() => setError(""), 4000);
            setActiveTab(tab || 0);
            return false;
        };

        // Tab 0: Basic Info
        if (!formData.studentId) return validationError("የተማሪ መታወቂያ ያስፈልጋል", 0);
        if (!/^DBU\d{7}$/.test(formData.studentId)) return validationError("የተማሪው መለያ ቁጥር ትክክል አይደለም። DBU እና ከዛ በኋላ 7 ቁጥሮች መሆን አለበት", 0);
        if (!formData.fullName) return validationError("የተማሪው ሙሉ ስም ያስፈልጋል", 0);
        if (!formData.sex) return validationError("ፆታ መመረጥ አለበት", 0);
        if (!formData.birthYear) return validationError("የትውልድ ዘመን ያስፈልጋል", 0);
        if (!formData.baptismalName) return validationError("ክርስትና ስም ያስፈልጋል", 0);
        if (!formData.priesthoodRank) return validationError("ሥልጣነ ክህነት መመረጥ አለበት", 0);
        if (!formData.motherTongue) return validationError("የአፍ መፍቻ ቋንቋ ያስፈልጋል", 0);

        // Tab 1: Address/Contact
        if (!formData.phone) return validationError("ስልክ ቁጥር ያስፈልጋል", 1);
        if (!/^[79]\d{8}$/.test(formData.phone)) return validationError("ስልክ ቁጥር በ 7 ወይም በ 9 መጀመር እና 9 አሃዝ መሆን አለበት", 1);
        if (!formData.region) return validationError("ክልል መመረጥ አለበት", 1);
        if (!formData.zone) return validationError("ዞን መመረጥ አለበት", 1);
        if (!formData.woreda) return validationError("ወረዳ ያስፈልጋል", 1);
        if (!formData.kebele) return validationError("ቀበሌ ያስፈልጋል", 1);
        if (!formData.gibiName) return validationError("የግቢ ጉባኤው ሥም መመረጥ አለበት", 1);
        if (!formData.parishChurch) return validationError("አጥቢያ ቤ/ክ መመረጥ አለበት", 1);
        if (!formData.emergencyName) return validationError("የተጠሪ ስም ያስፈልጋል", 1);
        if (!formData.emergencyPhone) return validationError("የተጠሪ ስልክ ያስፈልጋል", 1);
        if (!/^[79]\d{8}$/.test(formData.emergencyPhone)) return validationError("የተጠሪ ስልክ ቁጥር በ 7 ወይም በ 9 መጀመር እና 9 አሃዝ መሆን አለበት", 1);

        // Tab 2: Academic
        if (!formData.department) return validationError("የትምህርት ክፍል መመረጥ አለበት", 2);
        if (!formData.batch) return validationError("ባች/ዓመት መመረጥ አለበት", 2);

        // Tab 3: Spiritual
        if (!formData.serviceSection) return validationError("የአገልግሎት ክፍል መመረጥ አለበት", 3);
        if (!formData.filledBy) return validationError("መረጃውን የሞላው አካል ሥም ያስፈልጋል", 3);
        if (!formData.verifiedBy) return validationError("መረጃውን ያረጋገጠው አካል ሥም ያስፈልጋል", 3);

        setIsSubmitting(true);
        setTimeout(() => {

            const schoolInfo = {
                gpa: formData.gpa,
                participation: formData.participation,
                specialEducation: formData.specialEducation,
                specialPlace: formData.specialPlace,
                attendance: formData.attendance,
                educationYearly: formData.educationYearly,
                abinetEducation: formData.abinetEducation,
                specialNeed: formData.specialNeed,
                cumulativeGPA: formData.cumulativeGPA,
                membershipYear: formData.membershipYear
            };

            const updatedData = {
                id: formData.studentId,
                full_name: formData.fullName,
                gender: formData.sex,
                birth_date: formData.birthYear,
                age: formData.age,
                baptismal_name: formData.baptismalName,
                priesthood_rank: formData.priesthoodRank,
                mother_tongue: formData.motherTongue,
                other_languages: formData.otherLanguages,
                phone: formData.phone,
                region: formData.region,
                zone: formData.zone,
                woreda: formData.woreda,
                kebele: formData.kebele,
                gibi_name: formData.gibiName,
                center_and_woreda: formData.centerAndWoredaCenter,
                parish_church: formData.parishChurch,
                emergency_name: formData.emergencyName,
                emergency_phone: formData.emergencyPhone,
                department: formData.department,
                batch: formData.batch,
                school_info: schoolInfo,
                service_section: formData.serviceSection,
                graduation_year: formData.graduationYear,

                teacher_training: formData.teacherTraining,
                leadership_training: formData.leadershipTraining,
                other_trainings: formData.otherTrainings,

                additional_info: formData.additionalInfo,
                filled_by: formData.filledBy,
                verified_by: formData.verifiedBy,
                status: 'Student',
                photo_url: formData.photoUrl
            };

            updateStudent(student.id, updatedData)
                .then(() => {
                    if (onSave) onSave(updatedData);
                    onClose();
                })
                .catch(err => {
                    console.error("ውሂቡን ማስቀመጥ አልተቻለም", err);
                    setError(err.message || "ውሂቡን ማስቀመጥ አልተቻለም። እባክዎን እንደገና ይሞክሩ");
                })
                .finally(() => setIsSubmitting(false));
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">Edit Student Information</h2>
                        <p className="text-sm text-gray-600 mt-1">Update student details for {student.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-red-800 font-medium">{error}</span>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 px-8 pt-6 pb-2 border-b border-gray-50 bg-white">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {tab.icon}
                            <div className="text-left">
                                <div className="text-xs opacity-70 leading-none mb-0.5">{tab.subLabel}</div>
                                <div className="text-sm font-bold">{tab.label}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* TAB 1: BASIC INFO */}
                                {activeTab === 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="label-amharic">የተማሪው መታወቂያ <span className="text-red-500">*</span></label>
                                                <input
                                                    name="studentId"
                                                    placeholder="DBU1234567"
                                                    value={formData.studentId}
                                                    onChange={(e) => {
                                                        let val = e.target.value.toUpperCase();
                                                        if (/^[0-9]/.test(val)) val = 'DBU' + val;
                                                        if (val.length <= 10) {
                                                            handleInputChange({ target: { name: 'studentId', value: val } });
                                                        }
                                                    }}
                                                    required
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold tracking-wide"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="label-amharic">የተማሪው ሙሉ ሥም <span className="text-red-500">*</span></label>
                                                <input
                                                    name="fullName"
                                                    placeholder="አበበ ባልቻ..."
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="label-amharic">ፆታ <span className="text-red-500">*</span></label>
                                                <select name="sex" value={formData.sex} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">ምረጥ...</option>
                                                    <option value="male">ወንድ</option>
                                                    <option value="female">ሴት</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">የትውልድ ዘመን (በዓ.ም) <span className="text-red-500">*</span></label>
                                                    <input
                                                        name="birthYear"
                                                        type="number"
                                                        placeholder="1995"
                                                        value={formData.birthYear}
                                                        onChange={handleInputChange}
                                                        required
                                                        min="1990"
                                                        max={currentEthYear}
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">ዕድሜ</label>
                                                    <input name="age" value={formData.age} readOnly className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 font-bold" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label-amharic">ክርስትና ስም <span className="text-red-500">*</span></label>
                                                <input name="baptismalName" placeholder="G/Michael" value={formData.baptismalName} required onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="label-amharic">ሥልጣነ ክህነት <span className="text-red-500">*</span></label>
                                                <select name="priesthoodRank" value={formData.priesthoodRank} required onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">ምረጥ...</option>
                                                    <option value="lay">ምእመን</option>
                                                    <option value="diakon">ዲያቆን</option>
                                                    <option value="kahin">ካህን</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="label-amharic">የተማሪ ፎቶ</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative group">
                                                        {formData.photoUrl ? (
                                                            <img
                                                                src={formData.photoUrl}
                                                                alt="Preview"
                                                                className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                                            />
                                                        ) : (
                                                            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                                                                <Camera size={32} />
                                                            </div>
                                                        )}
                                                        <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-transform active:scale-95">
                                                            <Camera size={14} />
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        if (file.size > 5 * 1024 * 1024) { // 5MB limit check
                                                                            setError("ምስሉ ከ 5MB መብለጥ የለበትም");
                                                                            return;
                                                                        }
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => {
                                                                            setFormData(prev => ({ ...prev, photoUrl: reader.result }));
                                                                        };
                                                                        reader.readAsDataURL(file);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500 mb-2">ፎቶ ይምረጡ (Max 5MB)</p>
                                                        <div className="flex gap-2">
                                                            <input
                                                                name="photoUrl"
                                                                value={formData.photoUrl || ''}
                                                                onChange={handleInputChange}
                                                                placeholder="ወይም የፎቶ URL ያስገቡ..."
                                                                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600 font-mono"
                                                            />
                                                            {formData.photoUrl && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Remove Photo"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="label-amharic">የአፍ መፍቻ ቋንቋ <span className="text-red-500">*</span></label>
                                                <input
                                                    name="motherTongue"
                                                    value={formData.motherTongue}
                                                    onChange={handleInputChange}
                                                    placeholder="ቋንቋ"
                                                    required
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="label-amharic">ተጨማሪ ቋንቋዎች</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <input
                                                        name="lang-l1"
                                                        value={formData.otherLanguages?.l1 || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="ቋንቋ 1"
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                    <input
                                                        name="lang-l2"
                                                        value={formData.otherLanguages?.l2 || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="ቋንቋ 2"
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                    <input
                                                        name="lang-l3"
                                                        value={formData.otherLanguages?.l3 || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="ቋንቋ 3"
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: ADDRESS */}
                                {activeTab === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="label-amharic">ስልክ ቁጥር <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <img
                                                        src="https://flagcdn.com/w20/et.png"
                                                        srcSet="https://flagcdn.com/w40/et.png 2x"
                                                        width="20"
                                                        height="14"
                                                        alt="ET"
                                                        className="rounded-sm mr-2"
                                                    />
                                                    <span className="font-bold text-sm flex">
                                                        <span className="text-[#078930]">+</span>
                                                        <span className="text-[#FCDD09]">25</span>
                                                        <span className="text-[#DA121A]">1</span>
                                                    </span>
                                                    <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        if (val.length <= 9) handleInputChange({ target: { name: 'phone', value: val } });
                                                    }}
                                                    placeholder="9... or 7..."
                                                    maxLength={9}
                                                    pattern="[79][0-9]{8}"
                                                    className="w-full pl-28 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label-amharic">ክልል <span className="text-red-500">*</span></label>
                                            <select name="region" value={formData.region} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">ክልል ይምረጡ...</option>
                                                {Object.keys(ethiopianRegions).map(region => (
                                                    <option key={region} value={region}>{region}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-amharic">ዞን <span className="text-red-500">*</span></label>
                                            <select
                                                name="zone"
                                                value={formData.zone}
                                                onChange={handleInputChange}
                                                disabled={!formData.region}
                                                required
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">{formData.region ? 'ዞን ይምረጡ...' : 'መጀመሪያ ክልል ይምረጡ'}</option>
                                                {formData.region && ethiopianRegions[formData.region]?.map(zone => (
                                                    <option key={zone} value={zone}>{zone}</option>
                                                ))}
                                                <option value="Other">ሌላ (Other)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-amharic">ወረዳ <span className="text-red-500">*</span></label>
                                            <input
                                                name="woreda"
                                                value={formData.woreda}
                                                onChange={handleInputChange}
                                                placeholder="ወረዳ"
                                                required
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-amharic">ቀበሌ <span className="text-red-500">*</span></label>
                                            <input
                                                name="kebele"
                                                value={formData.kebele}
                                                onChange={handleInputChange}
                                                placeholder="ቀበሌ"
                                                required
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-amharic">የግቢ ጉባኤው ሥም <span className="text-red-500">*</span></label>
                                            <select
                                                name="gibiName"
                                                value={formData.gibiName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">ምረጥ...</option>
                                                <option value="ደ/ቀ/ግ/ጉባኤ">ደ/ቀ/ግ/ጉባኤ</option>
                                                <option value="ቭክትሪ">ቭክትሪ</option>
                                                <option value="ተና">ተና</option>
                                                <option value="ወረዳ">ወረዳ</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-amharic">ማእከለ እና ወረዳ ማእከል</label>
                                            <input
                                                name="centerAndWoredaCenter"
                                                value={formData.centerAndWoredaCenter}
                                                onChange={handleInputChange}
                                                placeholder="ማእከል/ወረዳ"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-amharic">የሚማሩበት አጥቢያ ቤ/ክ <span className="text-red-500">*</span></label>
                                            <select
                                                name="parishChurch"
                                                value={formData.parishChurch}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">ምረጥ...</option>
                                                <option value="ቅዱስ ገብራኤል ቤተ ክርስቲያን">ቅዱስ ገብራኤል ቤተ ክርስቲያን</option>
                                                <option value="ቅዱስ መዳኔአለም ቤተ ክርስቲያን">ቅዱስ መዳኔአለም ቤተ ክርስቲያን</option>
                                                <option value="ደ/ብ/ቅ/ገብርኤል">ደ/ብ/ቅ/ገብርኤል</option>
                                                <option value="Other">ሌላ (Other)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-amharic">የተጠሪ ስም <span className="text-red-500">*</span></label>
                                            <input name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-amharic">የተጠሪ ስልክ <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <img
                                                        src="https://flagcdn.com/w20/et.png"
                                                        srcSet="https://flagcdn.com/w40/et.png 2x"
                                                        width="20"
                                                        height="14"
                                                        alt="ET"
                                                        className="rounded-sm mr-2"
                                                    />
                                                    <span className="font-bold text-sm flex">
                                                        <span className="text-[#078930]">+</span>
                                                        <span className="text-[#FCDD09]">25</span>
                                                        <span className="text-[#DA121A]">1</span>
                                                    </span>
                                                    <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="emergencyPhone"
                                                    value={formData.emergencyPhone}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        if (val.length <= 9) handleInputChange({ target: { name: 'emergencyPhone', value: val } });
                                                    }}
                                                    placeholder="9... or 7..."
                                                    maxLength={9}
                                                    pattern="[79][0-9]{8}"
                                                    className="w-full pl-28 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: ACADEMIC */}
                                {activeTab === 2 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="label-amharic">የትምህርት ክፍል <span className="text-red-500">*</span></label>
                                                <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">Select Department</option>
                                                    <option value="Mechanical">Mechanical Engineering</option>
                                                    <option value="Architecture">Architecture</option>
                                                    <option value="Economics">Economics</option>
                                                    <option value="Journalism">Journalism</option>
                                                    <option value="Medicine">Medicine</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label-amharic">ባች/ዓመት <span className="text-red-500">*</span></label>
                                                <select name="batch" value={formData.batch} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">ዓመት ምረጥ</option>
                                                    <option value="1">1ኛ ዓመት</option>
                                                    <option value="2">2ኛ ዓመት</option>
                                                    <option value="3">3ኛ ዓመት</option>
                                                    <option value="4">4ኛ ዓመት</option>
                                                    <option value="5">5ኛ ዓመት</option>
                                                    <option value="6">6ኛ ዓመት</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">የውጤት መረጃ</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {['y1', 'y2', 'y3', 'y4', 'y5', 'y6'].map((year, idx) => (
                                                    <div key={year}>
                                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ዓመት {idx + 1}</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="4.0"
                                                            name={`gpa-${year}`}
                                                            placeholder="0.00"
                                                            value={formData.gpa[year]}
                                                            onChange={handleInputChange}
                                                            className="w-full text-center font-bold text-blue-600 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ))}
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">አማካይ ውጤት</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="4.0"
                                                        name="cumulativeGPA"
                                                        value={formData.cumulativeGPA}
                                                        onChange={handleInputChange}
                                                        className="w-full text-center font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: SPIRITUAL */}
                                {activeTab === 3 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="label-amharic">የአገልግሎት ክፍል ይምረጡ <span className="text-red-500">*</span></label>
                                                <select
                                                    name="serviceSection"
                                                    value={formData.serviceSection}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={user?.role === 'admin'}
                                                    className={`w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${user?.role === 'admin' ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
                                                >
                                                    <option value="">ምረጥ...</option>
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

                                        </div>

                                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                                            <h3 className="text-md font-bold text-blue-800 mb-6 border-b border-blue-200 pb-2">
                                                የአብነት ትምህርት እና ልዩ ፍላጎት:-
                                            </h3>

                                            <div className="space-y-6">
                                                <div>
                                                    <label className="label-amharic">የተማረውና አሁን የደረሰበት</label>
                                                    <input
                                                        name="specialEducation"
                                                        value={formData.specialEducation}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="የተማረው..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="label-amharic">የተማረው ልዩ ተሰጥኦ</label>
                                                    <textarea
                                                        name="specialPlace"
                                                        value={formData.specialPlace}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                                        placeholder="ልዩ ተሰጥኦ..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="label-amharic">የአብነት ትምህርት</label>
                                                        <input
                                                            name="abinetEducation"
                                                            value={formData.abinetEducation}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="የአብነት ትምህርት..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label-amharic">ልዩ ፍላጎት</label>
                                                        <input
                                                            name="specialNeed"
                                                            value={formData.specialNeed}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="ልዩ ፍላጎት..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="label-amharic">በግቢ ጉባኤው አባል የሆኑበት ዓ.ም</label>
                                                        <input
                                                            name="membershipYear"
                                                            type="number"
                                                            min="2000"
                                                            max={currentEthYear}
                                                            value={formData.membershipYear}
                                                            onChange={handleInputChange}
                                                            placeholder="20XX"
                                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label-amharic">የሚመረቁበት ዓ/ም</label>
                                                        <input
                                                            name="graduationYear"
                                                            type="number"
                                                            min={currentEthYear}
                                                            value={formData.graduationYear}
                                                            onChange={handleInputChange}
                                                            placeholder="20XX"
                                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {/* Courses */}
                                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                                                <h3 className="bg-blue-600 text-white px-6 py-2 rounded-full inline-block text-md font-bold mb-6">
                                                    1. በግቢ ጉባኤው የተማረወ ትምህርት:-
                                                </h3>
                                                <div className="space-y-3">
                                                    {['y1', 'y2', 'y3', 'y4', 'y5', 'y6'].map((year, idx) => (
                                                        <div key={`course-${year}`} className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-xs font-bold text-gray-500 uppercase">{idx + 1}ኛ ዓመት</div>
                                                            <input
                                                                name={`educationYearly-${year}`}
                                                                value={formData.educationYearly[year]}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                                placeholder="ኮርስ..."
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Participation */}
                                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                                                <h3 className="bg-blue-600 text-white px-6 py-2 rounded-full inline-block text-md font-bold mb-6">
                                                    2. በግቢ ጉባኤው ተሳትፎ:-
                                                </h3>
                                                <div className="space-y-3">
                                                    {['y1', 'y2', 'y3', 'y4', 'y5', 'y6'].map((year, idx) => (
                                                        <div key={`part-${year}`} className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-xs font-bold text-gray-500 uppercase">{idx + 1}ኛ ዓመት</div>
                                                            <input
                                                                name={`participation-${year}`}
                                                                value={formData.participation[year]}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                                placeholder="ተሳትፎ..."
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Attendance */}
                                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                                                <h3 className="bg-blue-600 text-white px-6 py-2 rounded-full inline-block text-md font-bold mb-6">
                                                    3. በግቢ ጉባኤው ክትትል ሁኔታ:-
                                                </h3>
                                                <div className="space-y-3">
                                                    {['y1', 'y2', 'y3', 'y4', 'y5', 'y6'].map((year, idx) => (
                                                        <div key={`att-${year}`} className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-xs font-bold text-gray-500 uppercase">{idx + 1}ኛ ዓመት</div>
                                                            <input
                                                                name={`attendance-${year}`}
                                                                value={formData.attendance[year]}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                                placeholder="ክትትል..."
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-xl mb-6">
                                            <h3 className="bg-blue-600 text-white px-4 py-2 rounded-full inline-block text-md font-bold mb-6">
                                                በግቢ ጉባኤው የወሰዳቸው ሥልጠናዎች፡-
                                            </h3>

                                            <div className="space-y-8">
                                                {/* Teacher Training Section */}
                                                <div>
                                                    <h4 className="label-amharic text-gray-800 mb-3 border-b border-yellow-200 pb-2">
                                                        የተተኪ መምህር ሥልጠና ፤- ደረጃና የቀን ብዛት
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-600">ደረጃ 1</div>
                                                            <input
                                                                name="teacherTraining-level1"
                                                                value={typeof formData.teacherTraining?.level1 === 'string' ? formData.teacherTraining.level1 : ''}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                                placeholder="የቀን ብዛት ይጻፉ..."
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-600">ደረጃ 2</div>
                                                            <input
                                                                name="teacherTraining-level2"
                                                                value={typeof formData.teacherTraining?.level2 === 'string' ? formData.teacherTraining.level2 : ''}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                                placeholder="የቀን ብዛት ይጻፉ..."
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-600">ደረጃ 3</div>
                                                            <input
                                                                name="teacherTraining-level3"
                                                                value={typeof formData.teacherTraining?.level3 === 'string' ? formData.teacherTraining.level3 : ''}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                                                placeholder="የቀን ብዛት ይጻፉ..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Leadership Training Section */}
                                                <div>
                                                    <h4 className="label-amharic text-gray-800 mb-3 border-b border-yellow-200 pb-2">
                                                        የተተኪ አመራር ሥልጠና ፤- ደረጃና የቀን ብዛት
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-600">ደረጃ 1</div>
                                                            <input
                                                                name="leadershipTraining-level1"
                                                                value={typeof formData.leadershipTraining?.level1 === 'string' ? formData.leadershipTraining.level1 : ''}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                                                placeholder="የቀን ብዛት ይጻፉ..."
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-600">ደረጃ 2</div>
                                                            <input
                                                                name="leadershipTraining-level2"
                                                                value={typeof formData.leadershipTraining?.level2 === 'string' ? formData.leadershipTraining.level2 : ''}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                                                placeholder="የቀን ብዛት ይጻፉ..."
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 flex-shrink-0 text-sm font-bold text-gray-600">ደረጃ 3</div>
                                                            <input
                                                                name="leadershipTraining-level3"
                                                                value={typeof formData.leadershipTraining?.level3 === 'string' ? formData.leadershipTraining.level3 : ''}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                                                                placeholder="የቀን ብዛት ይጻፉ..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Other Trainings */}
                                                <div>
                                                    <label className="label-amharic">ሌሎች ስልጠናዎች</label>
                                                    <textarea
                                                        name="otherTrainings"
                                                        value={formData.otherTrainings}
                                                        onChange={handleInputChange}
                                                        placeholder="ሌላ የወሰዱት ስልጠና ካለ ይጻፉ..."
                                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>



                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="label-amharic">ተጨማሪ መረጃ</label>
                                                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                                            </div>
                                            <div>
                                                <label className="label-amharic">መረጃውን የሞላው <span className="text-red-500">*</span></label>
                                                <input name="filledBy" value={formData.filledBy} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                                            </div>
                                            <div>
                                                <label className="label-amharic">መረጃውን ያረጋገጠው <span className="text-red-500">*</span></label>
                                                <input name="verifiedBy" value={formData.verifiedBy} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="label-amharic">ቀን <span className="text-red-500">*</span></label>
                                                <EthiopianDatePicker
                                                    value={formData.submissionDate}
                                                    onChange={(val) => handleInputChange({ target: { name: 'submissionDate', value: val } })}
                                                    minYear={2000}
                                                    maxYear={2050}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            ሰርዝ
                        </button>
                        <div className="flex items-center gap-3">
                            {activeTab > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(prev => prev - 1)}
                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    ወደኋላ
                                </button>
                            )}
                            {activeTab < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(prev => prev + 1)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                >
                                    ቀጣይ
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-100 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {isSubmitting ? 'በማስቀመጥ ላይ...' : 'ለውጦችን ያስቀምጡ'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditStudentModal;
