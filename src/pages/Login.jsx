import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, User, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 bg-[url('/login-bg.png')] bg-cover bg-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-4"
            >
                <div className="bg-white rounded-2xl shadow-premium overflow-hidden border border-gray-100">
                    <div className="bg-church-red p-8 text-center text-white relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/church.png')]"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white/20 p-3 rounded-full mb-4">
                                <ShieldCheck size={40} className="text-church-gold" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">DBU Gibi Gubae</h2>
                            <p className="text-church-gold/90 font-medium text-sm mt-1 uppercase tracking-widest">Admin Portal</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg text-sm border border-red-100"
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username / የተጠቃሚ ስም</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-church-red focus:border-church-red sm:text-sm"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password / የይለፍ ቃል</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 block w-full border-gray-300 rounded-xl focus:ring-church-red focus:border-church-red sm:text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded text-church-red focus:ring-church-red" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-church-red hover:underline font-medium">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-church-red hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-church-red transition-all transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>Login to System</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="px-8 pb-8 text-center">
                        <p className="text-xs text-gray-400">
                            © 2026 Debre Berhan University Gibi Gubae.
                            <br />All rights reserved.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
