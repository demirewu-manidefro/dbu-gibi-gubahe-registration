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

const EditStudentModal = ({ student, onClose }) => {
    const { updateStudent } = useAuth();
    const currentEthYear = toEthiopian(new Date()).year;
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Tab 1: Basic Info
        studentId: student.id || '',
        fullName: student.name || '',
        sex: student.sex || '',
        birthYear: student.birthYear || '',
        age: student.age || '',
        baptismalName: student.baptismalName || '',
        priesthoodRank: student.priesthoodRank || '',
        profilePhoto: null,
        photoUrl: student.photoUrl || '',
        motherTongue: student.motherTongue || '',
        otherLanguages: student.otherLanguages || { l1: '', l2: '', l3: '' },

        // Tab 2: Address
        phone: student.phone || '',
        region: student.region || '',
        zone: student.zone || '',
        woreda: student.woreda || '',
        kebele: student.kebele || '',
        gibiName: student.gibiName || '',
        centerAndWoredaCenter: student.centerAndWoredaCenter || '',
        parishChurch: student.parishChurch || '',
        emergencyName: student.emergencyName || '',
        emergencyPhone: student.emergencyPhone || '',

        // Tab 3: Academic
        department: student.dept || student.department || '',
        batch: student.year || student.batch || '',
        gpa: student.gpa || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' },
        cumulativeGPA: student.cumulativeGPA || '',

        // Tab 4: Spiritual
        serviceSection: student.section || '',
        graduationYear: student.graduationYear || '',
        membershipYear: student.membershipYear || '',
        specialEducation: student.specialEducation || '',
        specialPlace: student.specialPlace || '',
        participation: student.participation || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' },
        teacherTraining: student.teacherTraining || { level1: '', level2: '', level3: '' },
        leadershipTraining: student.leadershipTraining || { level1: '', level2: '', level3: '' },
        otherTrainings: student.otherTrainings || '',
        additionalInfo: student.additionalInfo || '',
        filledBy: student.filledBy || '',
        verifiedBy: student.verifiedBy || '',
        submissionDate: student.submissionDate || '',
        attendance: student.attendance || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' },
        educationYearly: student.educationYearly || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' },
        abinetEducation: student.abinetEducation || '',
        specialNeed: student.specialNeed || '',
        traineeType: student.traineeType || ''
    });

    // Auto-calculate age
    useEffect(() => {
        if (formData.birthYear && formData.birthYear.length === 4) {
            const year = parseInt(formData.birthYear);
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

        // Basic validation
        if (!/^DBU\d{7}$/.test(formData.studentId)) {
            setError("የተማሪው መለያ ቁጥር ትክክል አይደለም። DBU እና ከዛ በኋላ 7 ቁጥሮች መሆን አለበት");
            setTimeout(() => setError(""), 3000);
            setActiveTab(0);
            return;
        }

        if (!formData.serviceSection) {
            setError("እባክዎን የአገልግሎት ክፍሉን ይምረጡ");
            setTimeout(() => setError(""), 3000);
            setActiveTab(3);
            return;
        }

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
                cumulativeGPA: formData.cumulativeGPA
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
                membership_year: formData.membershipYear,

                teacher_training: formData.teacherTraining,
                leadership_training: formData.leadershipTraining,
                other_trainings: formData.otherTrainings,

                additional_info: formData.additionalInfo,
                filled_by: formData.filledBy,
                verified_by: formData.verifiedBy,
                status: 'Student',
                photo_url: formData.photoUrl,
                trainee_type: formData.traineeType
            };

            updateStudent(student.id, updatedData)
                .then(() => {
                    if (onSave) onSave(updatedData);
                    onClose();
                })
                .catch(err => {
                    console.error("ውሂቡን ማስቀመጥ አልተቻለም", err);
                    setError("ውሂቡን ማስቀመጥ አልተቻለም። እባክዎን እንደገና ይሞክሩ");
                })
                .finally(() => setIsSubmitting(false));
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden"
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
                <div className="flex gap-2 px-8 pt-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-blue-300'
                                }`}
                        >
                            {tab.icon}
                            <span className="text-sm font-bold">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8">
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
                                            <label className="label-amharic">የተማሪው መታወቂያ</label>
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
                                            <label className="label-amharic">የተማሪው ሙሉ ሥም</label>
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
                                            <label className="label-amharic">ፆታ</label>
                                            <select name="sex" value={formData.sex} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">ምረጥ...</option>
                                                <option value="male">ወንድ</option>
                                                <option value="female">ሴት</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label-amharic">የትውልድ ዘመን (በዓ.ም)</label>
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
                                            <label className="label-amharic">ክርስትና ስም</label>
                                            <input name="baptismalName" placeholder="G/Michael" value={formData.baptismalName} required onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="label-amharic">ሥልጣነ ክህነት</label>
                                            <select name="priesthoodRank" value={formData.priesthoodRank} required onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="">ምረጥ...</option>
                                                <option value="lay">ምእመን</option>
                                                <option value="diakon">ዲያቆን</option>
                                                <option value="kahin">ካህን</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-amharic">የፎቶ URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    name="photoUrl"
                                                    value={formData.photoUrl}
                                                    onChange={handleInputChange}
                                                    placeholder="https://..."
                                                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                {formData.photoUrl && (
                                                    <img src={formData.photoUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-amharic">የአፍ መፍቻ ቋንቋ</label>
                                            <input
                                                name="motherTongue"
                                                value={formData.motherTongue}
                                                onChange={handleInputChange}
                                                placeholder="ቋንቋ"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: ADDRESS */}
                            {activeTab === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="label-amharic">ስልክ ቁጥር</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <span className="font-bold text-gray-600 text-sm">+251</span>
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
                                                placeholder="911234567"
                                                maxLength={9}
                                                pattern="9[0-9]{8}"
                                                className="w-full pl-20 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-amharic">ክልል</label>
                                        <select name="region" value={formData.region} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">ክልል ይምረጡ...</option>
                                            {Object.keys(ethiopianRegions).map(region => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-amharic">ዞን</label>
                                        <select
                                            name="zone"
                                            value={formData.zone}
                                            onChange={handleInputChange}
                                            disabled={!formData.region}
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
                                        <label className="label-amharic">ወረዳ</label>
                                        <input
                                            name="woreda"
                                            value={formData.woreda}
                                            onChange={handleInputChange}
                                            placeholder="ወረዳ"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-amharic">ቀበሌ</label>
                                        <input
                                            name="kebele"
                                            value={formData.kebele}
                                            onChange={handleInputChange}
                                            placeholder="ቀበሌ"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-amharic">የግቢ ጉባኤው ሥም</label>
                                        <select
                                            name="gibiName"
                                            value={formData.gibiName}
                                            onChange={handleInputChange}
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
                                        <label className="label-amharic">የሚማሩበት አጥቢያ ቤ/ክ</label>
                                        <select
                                            name="parishChurch"
                                            value={formData.parishChurch}
                                            onChange={handleInputChange}
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
                                        <label className="label-amharic">የተጠሪ ስም</label>
                                        <input name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label-amharic">የተጠሪ ስልክ</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <span className="font-bold text-gray-600 text-sm">+251</span>
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
                                                placeholder="911234567"
                                                maxLength={9}
                                                pattern="9[0-9]{8}"
                                                className="w-full pl-20 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                            <label className="label-amharic">የትምህርት ክፍል</label>
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
                                            <label className="label-amharic">ባች/ዓመት</label>
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
                                            <label className="label-amharic">የአገልግሎት ክፍል ይምረጡ</label>
                                            <select
                                                name="serviceSection"
                                                value={formData.serviceSection}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <div>
                                            <label className="label-amharic">የሰልጣኝ ሁኔታ</label>
                                            <select
                                                name="traineeType"
                                                value={formData.traineeType}
                                                onChange={handleInputChange}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">ምረጥ...</option>
                                                <option value="Regular">መደበኛ (Regular)</option>
                                                <option value="Short-term">አጭር ጊዜ (Short-term)</option>
                                                <option value="Seminar">ሴሚናር (Seminar)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-amharic">የተማረውና አሁን የደረሰበት</label>
                                            <input name="specialEducation" value={formData.specialEducation} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="label-amharic">የተማረው ልዩ ተሰጥኦ</label>
                                            <input name="specialPlace" value={formData.specialPlace} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="label-amharic">በግቢ ጉባኤው አባል የሆኑበት ዓ.ም</label>
                                            <input name="membershipYear" type="number" min="2000" max={currentEthYear} value={formData.membershipYear} onChange={handleInputChange} placeholder="20XX" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="label-amharic">የሚመረቁበት ዓ/ም</label>
                                            <input name="graduationYear" type="number" min={currentEthYear} value={formData.graduationYear} onChange={handleInputChange} placeholder="20XX" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">ተሳትፎ እና ክትትል</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                            {['y1', 'y2', 'y3', 'y4', 'y5', 'y6'].map((year, idx) => (
                                                <div key={year} className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase block">{idx + 1}ኛ ተሳትፎ</label>
                                                    <input
                                                        name={`participation-${year}`}
                                                        value={formData.participation[year]}
                                                        onChange={handleInputChange}
                                                        className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1"
                                                        placeholder="-"
                                                    />
                                                    <label className="text-xs font-bold text-gray-500 uppercase block">{idx + 1}ኛ ክትትል</label>
                                                    <input
                                                        name={`attendance-${year}`}
                                                        value={formData.attendance[year]}
                                                        onChange={handleInputChange}
                                                        className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1"
                                                        placeholder="-"
                                                    />
                                                    <label className="text-xs font-bold text-gray-500 uppercase block">{idx + 1}ኛ ትምህርት</label>
                                                    <input
                                                        name={`educationYearly-${year}`}
                                                        value={formData.educationYearly[year]}
                                                        onChange={handleInputChange}
                                                        className="w-full text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded px-2 py-1"
                                                        placeholder="-"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-amharic">የአብነት ትምህርት</label>
                                            <input name="abinetEducation" value={formData.abinetEducation} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                                        </div>
                                        <div>
                                            <label className="label-amharic">ልዩ ፍላጎት</label>
                                            <input name="specialNeed" value={formData.specialNeed} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label-amharic">ተጨማሪ መረጃ</label>
                                            <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                                        </div>
                                        <div>
                                            <label className="label-amharic">መረጃውን የሞላው</label>
                                            <input name="filledBy" value={formData.filledBy} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                                        </div>
                                        <div>
                                            <label className="label-amharic">መረጃውን ያረጋገጠው</label>
                                            <input name="verifiedBy" value={formData.verifiedBy} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            {activeTab > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(prev => prev - 1)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Previous
                                </button>
                            )}
                            {activeTab < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(prev => prev + 1)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
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
