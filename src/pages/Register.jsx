import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const { registerStudent, checkUsernameUnique, user } = useAuth();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'username') {
            setUsernameError('');
        }
    };

    const handleUsernameBlur = (e) => {
        if (e.target.value && !checkUsernameUnique(e.target.value)) {
            setUsernameError('ይህ የተጠቃሚ ስም ተይዟል (Username taken)');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('የይለፍ ቃል አይመሳሰልም (Passwords do not match)');
            return;
        }

        if (usernameError) {
            setError('እባክዎ የተጠቃሚ ስም ያስተካክሉ (Please fix username error)');
            return;
        }

        setLoading(true);
        try {
            await registerStudent({
                ...formData,
                serviceSection: 'ሁሉም', // Default
                courses: { level1: false, level2: false },
                gpa: { y1: '', y2: '', y3: '', y4: '', y5: '' }
            });

            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-900/90 mix-blend-multiply"></div>

                <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 text-white">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12 group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            ወደ ዋናው ገጽ
                        </Link>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <img src="/logo-mk.jpg" alt="Logo" className="w-20 h-20 rounded-full border-4 border-white/20 mb-6 shadow-2xl" />
                            <h1 className="text-4xl font-extrabold mb-2">ተማሪዎች ምዝገባ</h1>
                            <p className="text-xl text-blue-200 font-medium tracking-wide">አዲስ ጊቢ ጉባኤ አባል</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-md"
                    >
                        <blockquote className="text-2xl font-serif leading-relaxed mb-6 italic text-white/90">
                            "ወደ እግዚአብሔር ቤት እንሂድ በተሉኝ ጊዜ ደስ አለኝ።"
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-white/30 flex-1"></div>
                            <span className="text-sm font-medium text-white/60">መዝሙረ ዳዊት 122:1</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-50 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-6"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">መለያ ይፍጠሩ</h2>
                        <p className="mt-2 text-gray-600">
                            አባል ለመሆን እባክዎ የሚከተለውን ቅጽ ይሙሉ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        {error && (
                            <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                                <AlertCircle size={20} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">የተማሪ መታወቂያ (Student ID as Username)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserCircle size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        onBlur={handleUsernameBlur}
                                        className={`block w-full pl-11 pr-4 py-3 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all ${usernameError ? 'border-red-500 bg-red-50' : ''}`}
                                        placeholder="DBU/..."
                                        required
                                    />
                                </div>
                                {usernameError && <p className="text-xs text-red-500 mt-1 ml-1">{usernameError}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">የይለፍ ቃል</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="block w-full pl-11 pr-10 py-3 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                            placeholder="••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ይለፍ ቃል ያረጋግጡ</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={20} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="block w-full pl-11 pr-4 py-3 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                                            placeholder="••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 font-bold text-lg shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] mt-6"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>ተመዝገብ</span>
                                    <UserPlus size={20} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                አካውንት አለኝ? ይግቡ
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
