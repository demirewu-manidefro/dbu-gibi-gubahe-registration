import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            login(username, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* Left Side - Image & Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-church-dark overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548625361-987dc79d6e50?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-church-red/90 to-church-dark/90 mix-blend-multiply"></div>
                
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
                            <h1 className="text-4xl font-extrabold mb-2">ደብረ ብርሀን ጊቢ ጉባኤ</h1>
                            <p className="text-xl text-church-gold font-medium tracking-wide">የአስተዳደር መግቢያ</p>
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

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-church-gold/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-24 w-64 h-64 bg-church-red/20 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-gray-50">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex justify-center mb-6">
                            <img src="/logo-mk.jpg" alt="Logo" className="w-16 h-16 rounded-full border-2 border-church-red shadow-lg" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">እንኳን በደህና መጡ</h2>
                        <p className="mt-2 text-gray-600">
                            እባክዎ ወደ ስርዓቱ ለመግባት መረጃዎን ያስገቡ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-xl text-sm border border-red-100"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ተጠቃሚ ስም</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={20} className="text-gray-400 group-focus-within:text-church-red transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-church-red/20 focus:border-church-red transition-all duration-200 ease-in-out text-gray-900 placeholder-gray-400"
                                        placeholder="የተጠቃሚ ስም ያስገቡ"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">የይለፍ ቃል</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-gray-400 group-focus-within:text-church-red transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-12 py-3.5 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-church-red/20 focus:border-church-red transition-all duration-200 ease-in-out text-gray-900 placeholder-gray-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer h-5 w-5 rounded border-gray-300 text-church-red focus:ring-church-red transition-all cursor-pointer" />
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">አስታውሰኝ</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-church-red hover:text-red-800 transition-colors">
                                የይለፍ ቃል ጠፋብዎ?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white bg-church-red hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-church-red/20 font-bold text-lg shadow-lg shadow-church-red/30 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
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
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-8">
                        © 2018 ዓ.ም. ደብረ ብርሀን ጊቢ ጉባኤ
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;