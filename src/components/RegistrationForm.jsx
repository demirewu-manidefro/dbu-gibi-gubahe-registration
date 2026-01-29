import React, { useState, useEffect } from 'react';
import {
    User,
    MapPin,
    GraduationCap,
    Church,
    Camera,
    ChevronRight,
    ChevronLeft,
    Save,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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



const RegistrationForm = () => {
    const { registerStudent, user } = useAuth(); // Add user
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Tab 1: Basic Info
        studentId: '',
        fullName: '',
        sex: '',
        birthYear: '',
        age: '',
        baptismalName: '',
        priesthoodRank: '',
        profilePhoto: null,
        motherTongue: '',
        otherLanguages: { l1: '', l2: '', l3: '' },

        // Tab 2: Address
        phone: '',
        region: '',
        zone: '',
        woreda: '',
        kebele: '',


        // Updated Address Fields
        gibiName: '',
        parishChurch: '',

        emergencyName: '',
        emergencyPhone: '',

        // Tab 3: Academic
        department: '',
        batch: '',
        gpa: { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' },
        cumulativeGPA: '',

        // Tab 4: Spiritual
        serviceSection: '',
        graduationYear: '',
        membershipYear: '',
        specialEducation: '',
        specialPlace: '',

        // This will now store the course names per year
        participation: { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' },

        // New Training Sections
        teacherTraining: { level1: '', level2: '', level3: '' },
        leadershipTraining: { level1: '', level2: '', level3: '' },

        additionalInfo: '',
        filledBy: '',
        verifiedBy: '',
        submissionDate: ''
    });

    // Populate data if student is logged in
    useEffect(() => {
        if (user && user.role === 'student') {
            setFormData(prev => ({
                ...prev,
                studentId: user.username || user.id || '',
                fullName: user.name || '',

                department: user.dept || '',
                batch: user.year || '',
                serviceSection: user.section || '',
                sex: user.sex || '',
                phone: user.phone || '',

            }));
        }
    }, [user]);

    // Auto-calculate age
    useEffect(() => {
        if (formData.birthYear && formData.birthYear.length === 4) {
            const year = parseInt(formData.birthYear);
            const currentYear = toEthiopian(new Date()).year; // Use Ethiopian year
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
        } else {
            // Reset dependent fields when parent changes
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

    const handleNext = () => setActiveTab(prev => Math.min(prev + 1, 3));
    const handleBack = () => setActiveTab(prev => Math.max(prev - 1, 0));

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        // Check Student ID (Strict: DBU + 7 digits)
        if (!/^DBU\d{7}$/.test(formData.studentId)) {
            setError("Invalid Student ID! try again");
            setTimeout(() => setError(""), 3000);
            setActiveTab(0); // Return to Basic Info tab to fix
            return;
        }

        // Check Service Section
        if (!formData.serviceSection) {
            setError("Please select a Service Section (የአገልግሎት ክፍል) before saving.");
            setTimeout(() => setError(""), 3000);
            setActiveTab(3); // Go to Spiritual tab
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            registerStudent(formData);
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/students');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user?.role === 'student' ? 'የግል መረጃ ማስተካከያ' : 'የተማሪዎች ምዝገባ'}</h1>
                    <p className="text-gray-500 font-medium">{user?.role === 'student' ? 'እባክዎ መረጃዎን በትክክል ይሙሉ' : 'የተማሪ ምዝገባ ማውጫ'}</p>
                </div>
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-400 border border-gray-100'
                                }`}
                        >
                            {tab.icon}
                            {activeTab === tab.id && (
                                <motion.span
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    className="text-sm font-bold whitespace-nowrap overflow-hidden"
                                >
                                    {tab.label}
                                </motion.span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                {/* Tab Header for Desktop */}
                <div className="grid grid-cols-4 border-b border-gray-50 bg-gray-50/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 flex flex-col items-center gap-1 transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">{tab.subLabel}</span>
                            <span className="font-semibold text-sm">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-600"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="p-10 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            {/* TAB 1: BASIC INFO */}
                            {activeTab === 0 && (
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="flex-1 space-y-6">
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
                                                />
                                            </div>
                                            <div>
                                                <label className="label-amharic">ፆታ</label>
                                                <select name="sex" value={formData.sex} onChange={handleInputChange} required>
                                                    <option value="">ምረጥ...</option>
                                                    <option value="male">ወንድ</option>
                                                    <option value="female">ሴት</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">የትውልድ ዘመን</label>
                                                    <input
                                                        name="birthYear"
                                                        type="number"
                                                        placeholder="1995"
                                                        value={formData.birthYear}
                                                        onChange={handleInputChange}
                                                        required
                                                        min="1990" max={new Date().getFullYear()}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">ዕድሜ</label>
                                                    <input name="age" value={formData.age} readOnly className="bg-gray-50 font-bold" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label-amharic">ክርስትና ስም</label>
                                                <input name="baptismalName" placeholder="G/Michael" value={formData.baptismalName} required onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label className="label-amharic">ሥልጣነ ክህነት</label>
                                                <select name="priesthoodRank" value={formData.priesthoodRank} required onChange={handleInputChange}>
                                                    <option value="">ምረጥ...</option>
                                                    <option value="lay">ምእመን</option>
                                                    <option value="diakon">ዲያቆን</option>
                                                    <option value="kahin">ካህን</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">የአፍ መፍቻ ቋንቋ</label>
                                                    <input
                                                        name="motherTongue"
                                                        value={formData.motherTongue}
                                                        onChange={handleInputChange}
                                                        placeholder="ኦሮምኛ, አማርኛ..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">የአፍ መፍቻ ቋንቋ 1</label>
                                                    <input
                                                        name="lang-l1"
                                                        value={formData.otherLanguages.l1}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">የአፍ መፍቻ ቋንቋ 2</label>
                                                    <input
                                                        name="lang-l2"
                                                        value={formData.otherLanguages.l2}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">የአፍ መፍቻ ቋንቋ 3</label>
                                                    <input
                                                        name="lang-l3"
                                                        value={formData.otherLanguages.l3}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-64 flex flex-col items-center">
                                        <div className="w-48 h-56 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 group hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden">
                                            {formData.profilePhoto ? (
                                                <img src={URL.createObjectURL(formData.profilePhoto)} className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Camera size={40} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-bold uppercase tracking-widest px-4 text-center">ፎቶ ስቀል</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.files[0] })}
                                                required />
                                        </div>
                                        <p className="mt-4 text-xs text-center text-gray-500 leading-relaxed italic">
                                            ለማንነት መታወቂያ የሚሆን ግልጽ ፎቶ ይስቀሉ። (ከ 2MB ያልበለጠ)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: ADDRESS */}
                            {activeTab === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                                            <MapPin size={18} /> አድራሻ
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-amharic">ስልክ ቁጥር</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                                                        <img
                                                            src="https://flagcdn.com/w20/et.png"
                                                            srcSet="https://flagcdn.com/w40/et.png 2x"
                                                            width="24"
                                                            height="16"
                                                            alt="Ethiopia"
                                                            className="rounded-sm shadow-sm mr-2"
                                                        />
                                                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#078930] via-[#FCDD09] to-[#DA121A] text-sm">+251</span>
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
                                                        title="Phone number must start with 9 and be 9 digits long"
                                                        className="w-full pl-28 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
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
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
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
                                            </div>
                                            <div>
                                                <label className="label-amharic">የግቢ ጉባኤው ሥም (Write only English)</label>
                                                <input
                                                    name="gibiName"
                                                    value={formData.gibiName}
                                                    onChange={handleInputChange}
                                                    placeholder="Example: DBU Gibi Gubae"
                                                    className="uppercase placeholder:normal-case"
                                                />
                                            </div>
                                            <div>
                                                <label className="label-amharic">የሚማሩበት አጥቢያ ቤ/ክ</label>
                                                <input name="parishChurch" value={formData.parishChurch} onChange={handleInputChange} placeholder="ደብረ..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
                                        <h3 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                                            የቅርብ ተጠሪ መረጃ
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-amharic">የተጠሪ ስም</label>
                                                <input name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} required />
                                            </div>
                                            <div>
                                                <label className="label-amharic">የተጠሪ ስልክ</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                                                        <img
                                                            src="https://flagcdn.com/w20/et.png"
                                                            srcSet="https://flagcdn.com/w40/et.png 2x"
                                                            width="24"
                                                            height="16"
                                                            alt="Ethiopia"
                                                            className="rounded-sm shadow-sm mr-2"
                                                        />
                                                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#078930] via-[#FCDD09] to-[#DA121A] text-sm">+251</span>
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
                                                        title="Phone number must start with 9 and be 9 digits long"
                                                        className="w-full pl-28 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* TAB 3: ACADEMIC */}
                            {activeTab === 2 && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="label-amharic">የትምህርት ክፍል</label>
                                            <select name="department" value={formData.department} onChange={handleInputChange} required>
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
                                            <select name="batch" value={formData.batch} onChange={handleInputChange} required>
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

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            የውጤት መረጃ
                                        </h3>
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
                                                        className="text-center font-bold text-blue-600"
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
                                                    className="text-center font-bold text-green-600 bg-green-50 border-green-200"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: SPIRITUAL */}
                            {activeTab === 3 && (
                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">የአገልግሎት ክፍል</h3>
                                        <div>
                                            <label className="label-amharic">የአገልግሎት ክፍል ይምረጡ</label>
                                            <select
                                                name="serviceSection"
                                                value={formData.serviceSection}
                                                onChange={handleInputChange}
                                                required
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
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="text-lg font-bold text-blue-800 border-b border-blue-200 pb-2 mb-4">የአብነት ትምህርት:-</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-amharic">የተማረውና አሁን የደረሰበት</label>
                                                <input name="specialEducation" value={formData.specialEducation} onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label className="label-amharic">የተማረው ልዩ ተሰጥኦ</label>
                                                <input name="specialPlace" value={formData.specialPlace} onChange={handleInputChange} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">በግቢ ጉባኤው አባል የሆኑበት ዓ.ም</label>
                                                    <input name="membershipYear" value={formData.membershipYear} onChange={handleInputChange} placeholder="20XX" />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">የሚመረቁበት ዓ/ም</label>
                                                    <input name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} placeholder="20XX" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <div className="bg-blue-600 text-white px-4 py-1 inline-block rounded-r-full -ml-6 mb-6 shadow-sm">
                                            <h3 className="text-md font-bold">በግቢ ጉባኤው የተማረው ኮርስ:-</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-y-3">
                                            {['y1', 'y2', 'y3', 'y4', 'y5', 'y6'].map((year, idx) => (
                                                <div key={year} className="flex items-center gap-4">
                                                    <span className="font-bold text-sm text-gray-600 w-20 italic">{idx + 1}ኛ ዓመት</span>
                                                    <input
                                                        type="text"
                                                        name={`participation-${year}`}
                                                        value={formData.participation[year]}
                                                        onChange={handleInputChange}
                                                        className="flex-1 bg-white border-blue-100 focus:border-blue-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <div className="bg-blue-600 text-white px-4 py-1 inline-block rounded-r-full -ml-6 mb-6 shadow-sm">
                                            <h3 className="text-md font-bold">በግቢ ጉባኤው የወሰዳቸው ሥልጠናዎች:-</h3>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Teacher Training */}
                                            <div>
                                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1 inline-block">የተተኪ መምህር ሥልጠና ፤- ደረጃና የቀን ብዛት</h4>
                                                <div className="space-y-3">
                                                    {['level1', 'level2', 'level3'].map((level, idx) => (
                                                        <div key={level} className="flex items-center gap-4">
                                                            <span className="font-bold text-sm text-gray-600 w-20">ደረጃ {idx + 1}</span>
                                                            <input
                                                                type="text"
                                                                name={`teacherTraining-${level}`}
                                                                value={formData.teacherTraining[level]}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border-blue-100 focus:border-blue-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Leadership Training */}
                                            <div>
                                                <h4 className="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-1 inline-block">የተተኪ አመራር ሥልጠና ፤- ደረጃና የቀን ብዛት</h4>
                                                <div className="space-y-3">
                                                    {['level1', 'level2', 'level3'].map((level, idx) => (
                                                        <div key={level} className="flex items-center gap-4">
                                                            <span className="font-bold text-sm text-gray-600 w-20">ደረጃ {idx + 1}</span>
                                                            <input
                                                                type="text"
                                                                name={`leadershipTraining-${level}`}
                                                                value={formData.leadershipTraining[level]}
                                                                onChange={handleInputChange}
                                                                className="flex-1 bg-white border-blue-100 focus:border-blue-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div>
                                            <label className="label-amharic">ተጨማሪ ማብራሪያ</label>
                                            <textarea
                                                name="additionalInfo"
                                                value={formData.additionalInfo}
                                                onChange={handleInputChange}
                                                rows="2"
                                                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label-amharic">መረጃውን የሞላው</label>
                                                <input name="filledBy" value={formData.filledBy} onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label className="label-amharic">መረጃውን ያረጋገጠው</label>
                                                <input name="verifiedBy" value={formData.verifiedBy} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label-amharic">ቀን</label>
                                            <input type="date" name="submissionDate" value={formData.submissionDate} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </form>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={activeTab === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-white shadow-sm'
                            }`}
                    >
                        <ChevronLeft size={20} /> ተመለስ
                    </button>

                    {activeTab < 3 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-blue-900 text-white shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all transform active:scale-[0.98]"
                        >
                            ቀጥል <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} />Save Student
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-10 right-10 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border-2 border-white/20"
                    >
                        <div className="bg-white/20 p-2 rounded-full">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="font-bold">ተማሪው በትክክል ተመዝግቧል!</p>
                            <p className="text-xs text-white/80">መረጃው ወደ ዳታቤዝ ገብቷል።</p>
                        </div>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed top-10 right-10 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border-2 border-white/20"
                    >
                        <div className="bg-white/20 p-2 rounded-full">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="font-bold">Error Check!</p>
                            <p className="text-sm text-white/90">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
        .label-amharic {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div >
    );
};

export default RegistrationForm;
