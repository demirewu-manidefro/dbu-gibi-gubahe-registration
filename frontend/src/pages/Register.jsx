import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { UserPlus, User, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, UserCircle, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const { signup, checkUsernameUnique, user } = useAuth();

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
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const validateUsername = (value) => {
        if (!value.trim()) {
            setUsernameError('Username is required');
            return false;
        }
        if (value.length < 3) {
            setUsernameError('Username must be at least 3 characters');
            return false;
        }

        setUsernameError('');
        return true;
    };

    const validatePassword = (value) => {
        if (!value) {
            setPasswordError('Password is required');
            return false;
        }
        if (value.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validateConfirmPassword = (value) => {
        if (!value) {
            setConfirmPasswordError('Confirm password is required');
            return false;
        }
        if (value !== formData.password) {
            setConfirmPasswordError('Passwords do not match');
            return false;
        }
        setConfirmPasswordError('');
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors while typing if they exist
        if (name === 'username' && usernameError) {
            validateUsername(value);
        }
        if (name === 'password' && passwordError) {
            validatePassword(value);
            if (formData.confirmPassword) {
                validateConfirmPassword(formData.confirmPassword);
            }
        }
        if (confirmPasswordError && (name === 'confirmPassword' || name === 'password')) {
            validateConfirmPassword(name === 'confirmPassword' ? value : formData.confirmPassword);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const isUsernameValid = validateUsername(formData.username);
        const isPasswordValid = validatePassword(formData.password);
        const isConfirmPasswordValid = validateConfirmPassword(formData.confirmPassword);
        if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        setLoading(true);
        try {
            console.log("Submitting registration...");
            await signup(formData.username, formData.password);
            console.log("Registration successful");
            navigate('/login');
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 dark:bg-gray-800 overflow-hidden">
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
                            <p className="text-xl text-blue-200 font-medium tracking-wide">አዲስ የጊቢ ጉባኤ አባል</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-md"
                    >
                        <blockquote className="text-2xl font-serif leading-relaxed mb-6 italic text-white/90">
                            "ወደ እግዚአብሔር ቤት እንሂድ ባሉኝ ጊዜ ደስ አለኝ።"
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-white/30 flex-1"></div>
                            <span className="text-sm font-medium text-white/60">መዝሙረ ዳዊት 122:1</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-50 dark:bg-gray-900 overflow-y-auto transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-6"
                >
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-between items-center mb-6">
                            <Link to="/" className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
                            </Link>
                            <img src="/logo-mk.jpg" alt="Logo" className="w-16 h-16 rounded-full border-2 border-blue-600 shadow-lg" />
                            <div className="w-10"></div> {/* Spacer for centering */}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">መለያ ይፍጠሩ</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            አባል ለመሆን እባክዎ የሚከተለውን ቅጽ ይሙሉ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        {error && (
                            <div className="flex items-center gap-3 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                                <AlertCircle size={20} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">የተጠቃሚ ስም </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserCircle size={20} className={`transition-colors ${usernameError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        onBlur={(e) => validateUsername(e.target.value)}
                                        className={`block w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${usernameError
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-600/20'
                                            }`}
                                        placeholder="Username"
                                    />
                                </div>
                                {usernameError && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {usernameError}
                                    </p>
                                )}
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">የይለፍ ቃል</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={20} className={`transition-colors ${passwordError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600'}`} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            onBlur={(e) => validatePassword(e.target.value)}
                                            className={`block w-full pl-11 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${passwordError
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-600/20'
                                                }`}
                                            placeholder="••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {passwordError}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ይለፍ ቃል ያረጋግጡ</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={20} className={`transition-colors ${confirmPasswordError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600'}`} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            onBlur={(e) => validateConfirmPassword(e.target.value)}
                                            className={`block w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${confirmPasswordError
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                                : 'border-gray-200 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-600/20'
                                                }`}
                                            placeholder="••••••"
                                        />
                                    </div>
                                    {confirmPasswordError && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {confirmPasswordError}
                                        </p>
                                    )}
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
                            <Link to="/login" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
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
