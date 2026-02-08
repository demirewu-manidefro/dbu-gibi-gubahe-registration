import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home, ArrowLeft, Search, Map } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen bg-[#0f172a] flex items-center justify-center p-6 overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse delay-700" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

            <div className="relative z-10 max-w-2xl w-full">
                <div className="text-center">
                    {/* Big 404 with Glitch Effect */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative inline-block"
                    >
                        <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-800/20 select-none">
                            404
                        </h1>
                        <motion.div
                            animate={{
                                x: [0, -2, 2, -1, 0],
                                skewX: [0, 2, -2, 1, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Ghost size={160} className="text-blue-400/30 blur-sm" />
                        </motion.div>
                    </motion.div>

                    {/* Content Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="mt-[-2rem] md:mt-[-4rem] backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            ገጹ ሊገኝ አልቻለም <span className="text-blue-400 font-light block mt-2 text-2xl md:text-3xl">Lost in Space?</span>
                        </h2>

                        <p className="text-blue-100/60 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
                            የፈለጉት ገጽ የለም ወይም ተሰርዟል። እባክዎን ወደ መነሻ ገጽ ይመለሱ ወይም ፍለጋዎን ይሞክሩ።
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <motion.button
                                whileHover={{ scale: 1.05, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-blue-100 bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                <ArrowLeft size={22} />
                                ተመለስ (Go Back)
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] transition-all"
                            >
                                <Home size={22} />
                                መነሻ ገጽ (Go Home)
                            </motion.button>
                        </div>

                        {/* Interactive Elements */}
                        <div className="mt-12 flex justify-center gap-8 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="flex flex-col items-center gap-2 text-blue-200">
                                <Search size={20} />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Search</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-blue-200">
                                <Map size={20} />
                                <span className="text-[10px] uppercase tracking-widest font-bold">explore</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer decoration */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 text-blue-400/40 text-xs font-mono uppercase tracking-[0.3em]"
                    >
                        Error Code: 0x404_NULL_REFERENCE_GIBI_GUBAE
                    </motion.p>
                </div>
            </div>

            {/* Floaties */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400/20 rounded-full pointer-events-none"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight
                    }}
                    animate={{
                        y: [null, Math.random() * -100 - 50],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default NotFound;
