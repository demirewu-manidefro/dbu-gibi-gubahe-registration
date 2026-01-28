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
    const { registerStudent } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        // Tab 1: Basic Info
        fullName: '',
        sex: '',
        birthYear: '',
        age: '',
        baptismalName: '',
        priesthoodRank: '',
        profilePhoto: null,

        // Tab 2: Address
        phone: '',
        region: 'Amhara',
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

    // Auto-calculate age
    useEffect(() => {
        if (formData.birthYear && formData.birthYear.length === 4) {
            const year = parseInt(formData.birthYear);
            const currentYear = toEthiopian(new Date()).year; // Use Ethiopian year
            setFormData(prev => ({ ...prev, age: currentYear - year }));
        }
    }, [formData.birthYear]);

    const tabs = [
        { id: 0, label: 'መሰረታዊ መረጃ', subLabel: 'Basic Info', icon: <User size={20} /> },
        { id: 1, label: 'አድራሻ', subLabel: 'Address', icon: <MapPin size={20} /> },
        { id: 2, label: 'ትምህርት', subLabel: 'Academic', icon: <GraduationCap size={20} /> },
        { id: 3, label: 'አገልግሎት', subLabel: 'Spiritual', icon: <Church size={20} /> },
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">የተማሪዎች ምዝገባ</h1>
                    <p className="text-gray-500 font-medium">Student Registration Dashboard</p>
                </div>
                <div className="flex gap-2">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${activeTab === tab.id
                                ? 'bg-church-red text-white shadow-lg'
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
                            className={`px-6 py-4 flex flex-col items-center gap-1 transition-all relative ${activeTab === tab.id ? 'text-church-red' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">{tab.subLabel}</span>
                            <span className="font-semibold text-sm">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 w-full h-1 bg-church-red"
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
                                                <label className="label-amharic">የተማሪው ሙሉ ሥም / Full Name</label>
                                                <input
                                                    name="fullName"
                                                    placeholder="Abebe Balcha..."
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="label-amharic">ፆታ / Sex</label>
                                                <select name="sex" value={formData.sex} onChange={handleInputChange} required>
                                                    <option value="">Select...</option>
                                                    <option value="male">Male / ወንድ</option>
                                                    <option value="female">Female / ሴት</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">የተወለደ ዘመን / YOB</label>
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
                                                    <label className="label-amharic">ዕድሜ / Age</label>
                                                    <input name="age" value={formData.age} readOnly className="bg-gray-50 font-bold" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label-amharic">ክርስትና ስም / Baptismal Name</label>
                                                <input name="baptismalName" placeholder="G/Michael" value={formData.baptismalName} onChange={handleInputChange} />
                                            </div>
                                            <div>
                                                <label className="label-amharic">ሥልጣነ ክህነት / Rank</label>
                                                <select name="priesthoodRank" value={formData.priesthoodRank} onChange={handleInputChange}>
                                                    <option value="lay">Mihimen (Lay) / ምእመን</option>
                                                    <option value="diakon">Diakon / ዲያቆን</option>
                                                    <option value="kahin">Kahin / ካህን</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-64 flex flex-col items-center">
                                        <div className="w-48 h-56 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 group hover:border-church-gold transition-colors cursor-pointer relative overflow-hidden">
                                            {formData.profilePhoto ? (
                                                <img src={URL.createObjectURL(formData.profilePhoto)} className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Camera size={40} className="group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-bold uppercase tracking-widest px-4 text-center">ሁኔታዊ ምስል / Upload Photo</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.files[0] })}
                                            />
                                        </div>
                                        <p className="mt-4 text-xs text-center text-gray-500 leading-relaxed italic">
                                            Upload a clear background photo for the identity card. Max 2MB.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: ADDRESS */}
                            {activeTab === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-church-red flex items-center gap-2">
                                            <MapPin size={18} /> አድራሻ እና ግንኙነት / Address & Contact
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-amharic">ስልክ ቁጥር / Phone Number</label>
                                                <input name="phone" placeholder="+251 9..." value={formData.phone} onChange={handleInputChange} required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">ክልል / Region</label>
                                                    <select name="region" value={formData.region} onChange={handleInputChange}>
                                                        <option value="Amhara">Amhara</option>
                                                        <option value="Oromia">Oromia</option>
                                                        <option value="Addis Ababa">Addis Ababa</option>
                                                        <option value="Tigray">Tigray</option>
                                                        <option value="South">South</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="label-amharic">ዞን / Zone</label>
                                                    <input name="zone" value={formData.zone} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-amharic">ወረዳ / Woreda</label>
                                                    <input name="woreda" value={formData.woreda} onChange={handleInputChange} />
                                                </div>
                                                <div>
                                                    <label className="label-amharic">ቀበሌ / Kebele</label>
                                                    <input name="kebele" value={formData.kebele} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
                                        <h3 className="text-lg font-bold text-church-red flex items-center gap-2">
                                            የቅርብ ተጠሪ / Emergency Contact
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-amharic">የተጠሪ ስም / Name</label>
                                                <input name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} required />
                                            </div>
                                            <div>
                                                <label className="label-amharic">የተጠሪ ስልክ / Phone</label>
                                                <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} required />
                                            </div>
                                        </div>
                                        <div className="mt-4 p-4 bg-church-gold/10 rounded-xl border border-church-gold/20 text-xs text-church-gold font-medium">
                                            NB: This information will be used for pastoral support in case of emergencies or illness.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: ACADEMIC */}
                            {activeTab === 2 && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="label-amharic">የት/ት ክፍል / Department</label>
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
                                            <label className="label-amharic">ባች/ዓመት / Batch Year</label>
                                            <select name="batch" value={formData.batch} onChange={handleInputChange} required>
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                                <option value="5">5th Year</option>
                                                <option value="6">6th Year</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            የውጤት መረጃ / GPA Tracking (1-5 Years)
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {['y1', 'y2', 'y3', 'y4', 'y5'].map((year, idx) => (
                                                <div key={year}>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Year {idx + 1}</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name={`gpa-${year}`}
                                                        placeholder="0.00"
                                                        value={formData.gpa[year]}
                                                        onChange={handleInputChange}
                                                        className="text-center font-bold text-church-red"
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
                                            <label className="label-amharic font-bold text-lg mb-4 block">የአገልግሎት ክፍል / Service Section</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Choir', 'Education', 'Charity', 'Development', 'Public Relations'].map(section => (
                                                    <label
                                                        key={section}
                                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.serviceSection === section
                                                            ? 'bg-church-red text-white border-church-red shadow-lg'
                                                            : 'bg-white border-gray-100 hover:border-church-gold'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="serviceSection"
                                                            value={section}
                                                            checked={formData.serviceSection === section}
                                                            onChange={handleInputChange}
                                                            className="hidden"
                                                        />
                                                        <span className="font-bold text-sm">{section}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="label-amharic font-bold text-lg mb-4 block">የተማረው ኮርስ / Course Levels</label>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-church-gold transition-all">
                                                    <input
                                                        type="checkbox"
                                                        name="level1"
                                                        checked={formData.courses.level1}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 rounded text-church-red focus:ring-church-red border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="font-bold block">የመጀመሪያ ደረጃ / Level 1 (Ye'Mejemeriya)</span>
                                                        <span className="text-xs text-gray-500">Basic Dogma & Liturgy foundation</span>
                                                    </div>
                                                </label>
                                                <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-church-gold transition-all">
                                                    <input
                                                        type="checkbox"
                                                        name="level2"
                                                        checked={formData.courses.level2}
                                                        onChange={handleInputChange}
                                                        className="w-5 h-5 rounded text-church-red focus:ring-church-red border-gray-300"
                                                    />
                                                    <div>
                                                        <span className="font-bold block">ሁለተኛ ደረጃ / Level 2 (Huletenya)</span>
                                                        <span className="text-xs text-gray-500">Advanced Church History & Theology</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label-amharic">የሚመረቅበት ዓ.ም / Graduation Year</label>
                                            <input name="graduationYear" placeholder="2018 E.C." value={formData.graduationYear} onChange={handleInputChange} />
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
                        <ChevronLeft size={20} /> Preview
                    </button>

                    {activeTab < 3 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-church-dark text-white shadow-lg hover:shadow-xl hover:bg-black transition-all transform active:scale-[0.98]"
                        >
                            Continue <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-10 py-3 rounded-xl font-bold bg-church-red text-white shadow-lg shadow-red-900/20 hover:bg-red-800 transition-all transform active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} /> Finish & Save Student
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
                            <p className="font-bold">Student Registered Successfully!</p>
                            <p className="text-xs text-white/80">The record has been added to the master database.</p>
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
