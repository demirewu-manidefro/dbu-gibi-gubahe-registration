import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative inline-block"
                >
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <FileQuestion size={120} className="text-blue-600 relative z-10 mx-auto" strokeWidth={1.5} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg"
                    >
                        <span className="text-2xl">🤔</span>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                        404
                    </h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Oops! The page you are looking for usually exists, but we can't seem to find it. It might have been moved or deleted.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                        >
                            <ArrowLeft size={20} />
                            Go Back
                        </button>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            <Home size={20} />
                            Go Home
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]" />
            </div>
        </div>
    );
};

export default NotFound;
