import React from 'react';
import { FileText, Clock, Construction } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-700">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-800 dark:to-slate-900 p-10 rounded-full mb-8 shadow-xl dark:shadow-none border border-white/20 relative"
            >
                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative z-10 text-blue-600 dark:text-blue-400">
                    <Construction size={80} strokeWidth={1.5} />
                </div>
            </motion.div>

            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 mb-4 tracking-tight">
                በቅርብ ቀን
            </h1>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">
                Reports Coming Soon
            </h2>

            <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">
                ይህ 'ሪፖርቶች' ገጽ በግንባታ ላይ ነው። በቅርቡ ዝርዝር ሪፖርቶችን እና መረጃዎችን እዚህ ያገኛሉ።
            </p>

            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-1 w-full max-w-xs bg-gray-100 dark:bg-slate-700 rounded-full mt-12 overflow-hidden"
            >
                <div className="h-full bg-blue-500 w-1/3 rounded-full animate-indeterminate-bar"></div>
            </motion.div>
        </div>
    );
};

export default Reports;
