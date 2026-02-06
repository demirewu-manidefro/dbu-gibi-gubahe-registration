import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { LogIn, User, Lock, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import SEO from '../components/SEO';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    React.useEffect(() => {
        if (location.state?.registrationSuccess) {
            setShowSuccessToast(true);
            if (location.state?.username) {
                setUsername(location.state.username);
            }

            const timer = setTimeout(() => setShowSuccessToast(false), 10000); // Hide after 10s
            return () => clearTimeout(timer);
        }
    }, [location]);

    const validateUsername = (value) => {
        if (!value.trim()) {
            setUsernameError('Username is required');
            return false;
        }
        if (value.length < 3) {
            setUsernameError('Username must be at least 4 characters');
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
        if (value.length < 4) {
            setPasswordError('Password must be at least 4 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const isUsernameValid = validateUsername(username);
        const isPasswordValid = validatePassword(password);

        if (!isUsernameValid || !isPasswordValid) {
            return;
        }

        setLoading(true);
        try {
            await login(username, password, rememberMe);
        } catch (err) {
            // Check if the error is about user not found
            if (err.message && (err.message.includes('not found') || err.message.includes('Invalid credentials') || err.message.includes('User does not exist'))) {
                setError(
                    <span>
                        ይህ መለያ አልተገኘም። እባክዎ <Link to="/register" className="underline font-semibold hover:text-red-800">መለያ ይፍጠሩ</Link> (Account not found. Please <Link to="/register" className="underline font-semibold hover:text-red-800">register</Link>)
                    </span>
                );
            } else {
                setError(err.message || 'የመግቢያ ስህተት (Login error)');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300">
            <SEO title="መግቢያ" description="ወደ ደብረ ብርሀን ዩኒቨርስቲ ጊቢ ጉባኤ ሲስተም ይግቡ።" />
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 dark:bg-gray-800 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548625361-987dc79d6e50?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
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
                            <h1 className="text-4xl font-extrabold mb-2">ደብረ ብርሃን ጊቢ ጉባኤ</h1>
                            <p className="text-xl text-blue-400 font-medium tracking-wide">መግቢያ (Login)</p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="max-w-md"
                    >
                        <blockquote className="text-2xl font-serif leading-relaxed mb-6 italic text-white/90">
                            "ትምህርትህ እምነትህን ያጠናክረው።"
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-white/30 flex-1"></div>
                            <span className="text-sm font-medium text-white/60">ቅዱስ ያሬድ</span>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-between items-center mb-6">
                            <Link to="/" className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-200" />
                            </Link>
                            <img src="/logo-mk.jpg" alt="Logo" className="w-16 h-16 rounded-full border-2 border-blue-600 shadow-lg" />
                            <div className="w-10"></div> {/* Spacer for centering */}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">እንኳን በደህና መጡ</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            እባክዎ ወደ ስርዓቱ ለመግባት መረጃዎን ያስገቡ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-3 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ተጠቃሚ ስም</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={20} className={`transition-colors ${usernameError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (usernameError) validateUsername(e.target.value);
                                        }}
                                        onBlur={(e) => validateUsername(e.target.value)}
                                        className={`block w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 transition-all duration-200 ease-in-out text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${usernameError
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

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">የይለፍ ቃል</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={20} className={`transition-colors ${passwordError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600'}`} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) validatePassword(e.target.value);
                                        }}
                                        onBlur={(e) => validatePassword(e.target.value)}
                                        className={`block w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 transition-all duration-200 ease-in-out text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${passwordError
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-gray-200 dark:border-gray-600 focus:border-blue-600 focus:ring-blue-600/20'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {passwordError}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer bg-white dark:bg-gray-700"
                                    />
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">አስታውሰኝ</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 font-bold text-lg shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>ግቡ</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <Link to="/register" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                አካውንት የለኝም ልመዝገብ
                            </Link>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                        © {new Date().getFullYear() - 8 + ((new Date().getMonth() > 8 || (new Date().getMonth() === 8 && new Date().getDate() >= 11)) ? 1 : 0)} ዓ.ም. ደብረ ብርሀን ጊቢ ጉባኤ
                    </p>
                </motion.div>
                {/* Success Toast for Registration */}
                <AnimatePresence>
                    {showSuccessToast && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="fixed top-5 right-5 z-50 w-full max-w-md bg-green-600 shadow-2xl rounded-2xl p-6 border-l-4 border-yellow-400 text-white"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-2 rounded-full shrink-0">
                                    <CheckCircle2 size={24} className="text-white" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-lg font-bold">
                                        በተሳካ ተመዝግበዋል!
                                    </h3>
                                    <div className="text-white/90 text-sm space-y-2">
                                        <p>
                                            <span className="font-bold text-yellow-300">ማሳሰቢያ:</span> እባክዎ በ<strong>24 ሰዓት</strong> ውስጥ መለያዎ ውስጥ ገብተው መረጃዎን ያሟሉ። አለበለዚያ አካውንቶ ይሰረዛል።
                                        </p>
                                        <p className="text-xs opacity-80 pt-2 border-t border-white/20">
                                            Please login and complete your profile within <strong>1 day</strong>.
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Login;
