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
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toEthiopian } from '../utils/ethiopianDateUtils';

const RegistrationForm = () => {
    const { registerStudent, user } = useAuth(); // Add user
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

        // Tab 2: Address
        phone: '',
        region: '',
        zone: '',
        woreda: '',
        kebele: '',
        emergencyName: '',
        emergencyPhone: '',

        // Tab 3: Academic
        department: '',
        batch: '',
        gpa: { y1: '', y2: '', y3: '', y4: '', y5: '' },

        // Tab 4: Spiritual
        serviceSection: '',
        courses: { level1: false, level2: false },
        graduationYear: ''
    });

    // Populate data if student is logged in
    useEffect(() => {
        if (user && user.role === 'student') {
            setFormData(prev => ({
                ...prev,
                studentId: user.username || user.id || '',
                fullName: user.name || '',
                // Other fields would be populated here if they exist in user object
                department: user.dept || '',
                batch: user.year || '',
                serviceSection: user.section || '',
                sex: user.sex || '',
                phone: user.phone || '',
                // In a real app, we would map all fields
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
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNext = () => setActiveTab(prev => Math.min(prev + 1, 3));
    const handleBack = () => setActiveTab(prev => Math.max(prev - 1, 0));

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.serviceSection) {
            alert("Please select a Service Section (የአገልግሎት ክፍል) before saving.");
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
                                                    placeholder="DBU..."
                                                    value={formData.studentId}
                                                    onChange={handleInputChange}
                                                    required
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
                                                <input name="phone" placeholder="+251 ..." value={formData.phone} onChange={handleInputChange} required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">ክልል</label>
                                                    <select name="region" value={formData.region} onChange={handleInputChange}>
                                                        <option value="Amhara">አማራ</option>
                                                        <option value="Oromia">ኦሮሚያ</option>
                                                        <option value="Addis Ababa">አዲስ አበባ</option>
                                                        <option value="Tigray">ትግራይ</option>
                                                        <option value="Afar">አፋር</option>
                                                        <option value="Somali">ሶማሌ</option>
                                                        <option value="Benishangul Gumuz">ቤኒሻንጉል ጉሙዝ</option>
                                                        <option value="Gambella">ጋምቤላ</option>
                                                        <option value="Harari">ሐረሪ</option>
                                                        <option value="Dire Dawa">ድሬዳዋ</option>
                                                        <option value="Central Ethiopia">ማዕከላዊ ኢትዮጵያ</option>
                                                        <option value="South Ethiopia">ደቡብ ኢትዮጵያ</option>
                                                        <option value="South West Ethiopia Peoples' Region">ደቡብ ምዕራብ ኢትዮጵያ</option>

                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label-amharic">ዞን</label>
                                                    <input name="zone" value={formData.zone} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">ወረዳ</label>
                                                    <input name="woreda" value={formData.woreda} onChange={handleInputChange} />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">ቀበሌ</label>
                                                    <input name="kebele" value={formData.kebele} onChange={handleInputChange} />
                                                </div>
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
                                                <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} required />
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
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {['y1', 'y2', 'y3', 'y4', 'y5'].map((year, idx) => (
                                                <div key={year}>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">ዓመት {idx + 1}</label>
                                                    <input
                                                        type="number"
                                                        step="1.45"
                                                        name={`gpa-${year}`}
                                                        placeholder="1.45"
                                                        value={formData.gpa[year]}
                                                        onChange={handleInputChange}
                                                        className="text-center font-bold text-blue-600"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: SPIRITUAL */}
                            {activeTab === 3 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="label-amharic font-bold text-lg mb-4 block">የአገልግሎት ክፍል </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'እቅድ', label: 'እቅድ' },
                                                    { id: 'ትምህርት', label: ' ትምህርት' },
                                                    { id: 'ልማት', label: 'ልማት' },
                                                    { id: 'ባች', label: 'ባች' },
                                                    { id: 'ሙያ', label: 'ሙያ' },
                                                    { id: 'ቋንቋ', label: 'ቋንቋ' },
                                                    { id: 'አባላት', label: 'አባላት' },
                                                    { id: 'ኦዲት', label: 'ኦዲት' },
                                                    { id: 'ሂሳብ', label: 'ሂሳብ' }
                                                ].map((section) => (
                                                    <label
                                                        key={section.id}
                                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.serviceSection === section.id
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                            : 'bg-white border-gray-100 hover:border-blue-400'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="serviceSection"
                                                            value={section.id}
                                                            checked={formData.serviceSection === section.id}
                                                            onChange={handleInputChange}
                                                            className="hidden"
                                                        />
                                                        <span className="font-bold text-sm">{section.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="label-amharic font-bold text-lg mb-4 block">የተማረው ኮርስ</label>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-blue-400 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        name="level1"
                                                        checked={formData.courses.level1}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="font-bold block">የመጀመሪያ ደረጃ</span>
                                                        <span className="text-xs text-gray-500">የዶግማ እና የቅዳሴ መርሆዎች</span>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-blue-400 transition-all">
                                                    <input
                                                        type="checkbox"
                                                        name="level2"
                                                        checked={formData.courses.level2}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-600 border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="font-bold block">ሁለተኛ ደረጃ</span>
                                                        <span className="text-xs text-gray-500">የቤተክርስቲያን ታሪክ እና ቲዎሎጂ</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label-amharic">የሚመረቅበት ዓ.ም</label>
                                            <input name="graduationYear" placeholder="2018" value={formData.graduationYear} onChange={handleInputChange} />
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
        </div>
    );
};

export default RegistrationForm;
