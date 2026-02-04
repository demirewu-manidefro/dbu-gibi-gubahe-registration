import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Users,
    BookOpen,
    Heart,
    Music,
    Calendar,
    MapPin,
    ArrowRight,
    Cross,
    Shield,
    Link as LinkIcon,
    Menu,
    X,
    Facebook,
    Instagram,
    Send
} from 'lucide-react';

const LandingPage = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const [scrolled, setScrolled] = useState(false);
    const [bgPosY, setBgPosY] = useState(0);
    const [lang, setLang] = useState('am');
    const [langOpen, setLangOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            const s = window.scrollY > 10;
            if (s !== scrolled) setScrolled(s);
            setBgPosY(window.scrollY * 0.3);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [scrolled]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <a href="#home" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90">
                            <img src="/logo-mk.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 leading-none">
                                    {lang === 'am' ? 'ደብረ ብርሃን ዩኒቨርስቲ ' : 'Debre Berhan University '}
                                </h1>
                                <p className="text-xs text-blue-600 font-medium tracking-widest">
                                    {lang === 'am' ? 'ግቢ ጉባኤ' : 'Gibi Gubae'}
                                </p>
                            </div>
                        </a>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={24} className="text-gray-700" />
                        </button>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#home" className="group relative text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                {lang === 'am' ? 'መነሻ' : 'Home'}
                                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
                            </a>
                            <a href="#about" className="group relative text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                {lang === 'am' ? 'ስለ እኛ' : 'About'}
                                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
                            </a>
                            <a href="#structure" className="group relative text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                {lang === 'am' ? 'መዋቅር' : 'Structure'}
                                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
                            </a>
                            <a href="#activities" className="group relative text-gray-600 hover:text-blue-600 font-medium transition-colors">
                                {lang === 'am' ? 'መርሐ ግብሮች' : 'Activities'}
                                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
                            </a>
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="px-6 py-2.5 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-800 transition-all transform hover:scale-105 shadow-lg shadow-gray-200">
                                    {lang === 'am' ? 'መግቢያ' : 'Login'}
                                </Link>
                                <div className="relative">
                                    <button onClick={() => setLangOpen(prev => !prev)} className="px-4 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium hover:bg-blue-50 transition transform hover:scale-105">
                                        {lang === 'am' ? 'አማ' : 'EN'}
                                    </button>
                                    {langOpen && (
                                        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                                            <button onClick={() => { setLang('en'); setLangOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-blue-50">EN</button>
                                            <button onClick={() => { setLang('am'); setLangOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-blue-50">አማ</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl md:hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <img src="/logo-mk.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-blue-600" />
                                    <span className="font-bold text-gray-900">
                                        {lang === 'am' ? 'ግቢ ጉባኤ' : 'Gibi Gubae'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X size={24} className="text-gray-700" />
                                </button>
                            </div>
                            <div className="p-6 space-y-2">
                                {[
                                    { href: '#home', label: lang === 'am' ? 'መነሻ' : 'Home' },
                                    { href: '#about', label: lang === 'am' ? 'ስለ እኛ' : 'About' },
                                    { href: '#structure', label: lang === 'am' ? 'መዋቅር' : 'Structure' },
                                    { href: '#activities', label: lang === 'am' ? 'መርሐ ግብሮች' : 'Activities' }
                                ].map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                            <div className="p-6 border-t border-gray-100 space-y-3">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full py-3 rounded-xl bg-blue-900 text-white font-bold text-center hover:bg-blue-800 transition-colors"
                                >
                                    {lang === 'am' ? 'መግቢያ' : 'Login'}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full py-3 rounded-xl bg-blue-100 text-blue-900 font-bold text-center hover:bg-blue-200 transition-colors"
                                >
                                    {lang === 'am' ? 'ይመዝገቡ' : 'Register'}
                                </Link>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => { setLang('am'); }}
                                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${lang === 'am' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        አማርኛ
                                    </button>
                                    <button
                                        onClick={() => { setLang('en'); }}
                                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        English
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <section id="home" className="relative min-h-screen pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('/hero_image.jpeg')] bg-cover" style={{ backgroundPosition: `center ${-bgPosY}px` }} />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/10" />
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-400/5 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/5 blur-3xl rounded-full transform -translate-x-1/4 translate-y-1/4" />

                <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center lg:text-left"
                        >
                            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 font-semibold text-sm mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                {lang === 'en' && 'Founded 1977 E.C.'}
                            </motion.div>

                            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6" style={{ fontFamily: lang === 'am' ? 'Tint, sans-serif' : 'inherit' }}>
                                {lang === 'am' ? 'መንፈሳዊ አንድነት በ' : 'Spiritual Unity in '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">{lang === 'am' ? 'ዩኒቨርሲቲ' : 'University'}</span>
                            </motion.h1>

                            <motion.p variants={fadeIn} className="text-xl text-white mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md">
                                {lang === 'am'
                                    ? 'ለተማሪዎች መንፈሳዊ መጠለያ፣ በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ሥርዓት ላይ የተመሠረተ። "ትምህርትህ እምነትህን ያጠናክረው።"'
                                    : 'A spiritual refuge for students, rooted in the Ethiopian Orthodox Tewahedo tradition. "Let your education strengthen your faith."'}
                            </motion.p>

                            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/register" className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group">
                                    {lang === 'am' ? 'ቤተሰብ ይሁኑ' : 'Join the Family'}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="#about" className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                                    {lang === 'am' ? 'ተጨማሪ ይወቁ' : 'Learn More'}
                                </a>
                            </motion.div>
                        </motion.div>


                    </div>
                </div>
                <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
                    <a href="#about" className="animate-bounce">
                        <ChevronRight className="rotate-90 text-white drop-shadow-lg" size={32} />
                    </a>
                </div>
            </section>

            {/* Mission Section */}
            <section id="about" className="py-20 bg-gray-50">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">{lang === 'am' ? 'ተልዕኳችን' : 'Our Mission'}</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{lang === 'am' ? 'እምነትን በትምህርት ማሳደግ' : 'Nurturing Faith through Education'}</h3>
                        <p className="text-gray-600 text-lg">
                            {lang === 'am'
                                ? '"ያለ መንፈሳዊ መሰረት ትምህርት በአሸዋ ላይ እንደተሰራ ቤት ነው።" — ቅዱስ ያሬድ። ተማሪዎች መንፈሳዊ ህይወታቸውን እንዲጠብቁ እና የቤተሰብነት ስሜት እንዲሰማቸው እንሰራለን።'
                                : '"Education without spiritual foundation is like a house built on sand." — St. Yared. We work to help students maintain their spiritual life and feel a sense of family.'}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Heart className="w-8 h-8 text-blue-600" />,
                                title: "መንፈሳዊ እድገት",
                                desc: "በጸሎት እና በጾም ከእግዚአብሔር ጋር ያለንን ግንኙነት ማጠናከር።"
                            },
                            {
                                icon: <BookOpen className="w-8 h-8 text-blue-400" />,
                                title: "የቤተክርስቲያን ትምህርት",
                                desc: "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያንን አስተምህሮ ማጥናት እና መረዳት።"
                            },
                            {
                                icon: <Users className="w-8 h-8 text-blue-600" />,
                                title: "የማህበረሰብ ድጋፍ",
                                desc: "በእምነት፣ በትምህርት እና በህይወት ፈተናዎች እርስ በርስ መደጋገፍ።"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.2 }}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-premium transition-all"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">
                                    {idx === 0 ? (lang === 'am' ? 'መንፈሳዊ እድገት' : 'Spiritual Growth')
                                        : idx === 1 ? (lang === 'am' ? 'የቤተክርስቲያን ትምህርት' : 'Church Education')
                                            : (lang === 'am' ? 'የማህበረሰብ ድጋፍ' : 'Community Support')}
                                </h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {idx === 0 ? (lang === 'am' ? 'በጸሎት እና በጾም ከእግዚአብሔር ጋር ያለንን ግንኙነት ማጠናከር።' : 'Deepening our relationship with God through prayer and fasting.')
                                        : idx === 1 ? (lang === 'am' ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያንን አስተምህሮ ማጥናት እና መረዳት።' : 'Studying and understanding the Orthodox Tewahedo Church.')
                                            : (lang === 'am' ? 'በእምነት፣ በትምህርት እና በህይወት ፈተናዎች እርስ በርስ መደጋገፍ።' : 'Mutual support in faith, study, and life.')}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Structure Section */}
            <section id="structure" className="py-20 bg-white">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center">
                        <img
                            src="/stracture.jpg"
                            alt="Structure"
                            className="w-full max-w-6xl h-auto rounded-3xl shadow-2xl border border-gray-100"
                        />
                    </div>
                </div>
            </section>

            {/* Weekly Activities */}
            <section id="activities" className="py-20 bg-blue-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/church.png')]"></div>
                <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">{lang === 'am' ? 'ይሳተፉ' : 'Participate'}</h2>
                            <h3 className="text-3xl md:text-4xl font-extrabold">{lang === 'am' ? 'ሳምንታዊ መርሐ ግብሮች' : 'Weekly Activities'}</h3>
                        </div>
                        <Link to="/register" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-white transition-colors font-bold">
                            {lang === 'am' ? 'ሙሉ መርሐ ግብር ይመልከቱ' : 'View Full Schedule'} <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {(lang === 'am' ? [
                            { title: "የጥምቀት በዓል", sub: "ዓመታዊ በዓል", desc: "የጌታችን ኢየሱስ ክርስቶስን ጥምቀት በድምቀት ማክበር።", color: "bg-blue-600" },
                            { title: "የጸሎት ሥርዓት", sub: "ዕለታዊ", desc: "ከጥንታዊ ሥርዓታችን ጋር የሚያገናኘን የጸሎት ጊዜ።", color: "bg-blue-500" },
                            { title: "መዝሙር ጥናት", sub: "ሳምንታዊ", desc: "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ዝማሬዎችን መማር እና ማቅረብ።", color: "bg-blue-400" },
                            { title: "የሕይወት ትምህርት", sub: "ሳምንታዊ", desc: "ሙሉ ክርስቶስን የምንማርበት ጊዜ።", color: "bg-blue-400" },
                            { title: "የቅዱሳን ታሪክ", sub: "ሳምንታዊ", desc: "የቅዱሳን አባቶቻችንን ህይወት እና ተአምራት መማር።", color: "bg-blue-400" },
                            { title: "ማህበረሰብ አገልግሎት", sub: "ወርሃዊ", desc: "ለህብረተሰብ የምናደርገው የፍቅር አገልግሎት።", color: "bg-blue-400" }
                        ] : [
                            { title: "Epiphany Celebration", sub: "Annual Festival", desc: "Celebrating the baptism of our Lord Jesus Christ.", color: "bg-blue-600" },
                            { title: "Prayer Service", sub: "Daily", desc: "Prayer time connecting us with our ancient traditions.", color: "bg-blue-500" },
                            { title: "Hymn Study", sub: "Weekly", desc: "Learning and presenting Ethiopian Orthodox Tewahedo hymns.", color: "bg-blue-400" },
                            { title: "Life Education", sub: "Weekly", desc: "Time to learn about living in Christ.", color: "bg-blue-400" },
                            { title: "Saints' History", sub: "Weekly", desc: "Learning the lives and miracles of our holy fathers.", color: "bg-blue-400" },
                            { title: "Community Service", sub: "Monthly", desc: "Acts of love and service to the community.", color: "bg-blue-400" }
                        ]).map((activity, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl ${activity.color} mb-6 flex items-center justify-center shadow-lg`}>
                                    <Calendar className="text-white" size={24} />
                                </div>
                                <h4 className="text-xl font-bold mb-1">{activity.title}</h4>
                                <p className="text-sm text-white/50 mb-4 font-serif">{activity.sub}</p>
                                <p className="text-white/70 leading-relaxed text-sm">
                                    {activity.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/logo-mk.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-blue-600" />
                                <span className="text-xl font-bold text-gray-900">
                                    {lang === 'am' ? 'ደብረ ብርሃን ጊቢ ጉባኤ' : 'Debre Berhan Gibi Gubae'}
                                </span>
                            </div>
                            <p className="text-gray-500 mb-6 max-w-sm">
                                {lang === 'am'
                                    ? 'የተማሪዎችን እምነት የሚያጎለብት ንቁ መንፈሳዊ ማህበረሰብ መፍጠር።'
                                    : 'Creating an active spiritual community that strengthens students\' faith.'}
                            </p>
                            <div className="flex gap-4">
                                <a href="https://web.facebook.com/debbirunigibygubaye/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-80 transition-all shadow-md">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white hover:opacity-80 transition-all shadow-md">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-[#0088CC] flex items-center justify-center text-white hover:opacity-80 transition-all shadow-md">
                                    <Send size={20} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:opacity-80 transition-all shadow-md">
                                    <X size={20} />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">{lang === 'am' ? 'ፈጣን አገናኞች' : 'Quick Links'}</h4>
                            <ul className="space-y-3 text-gray-600 text-sm">
                                <li><a href="#about" className="hover:text-blue-600">{lang === 'am' ? 'ስለ እኛ' : 'About Us'}</a></li>
                                <li><a href="#structure" className="hover:text-blue-600">{lang === 'am' ? 'መዋቅር' : 'Structure'}</a></li>
                                <li><a href="#activities" className="hover:text-blue-600">{lang === 'am' ? 'መርሐ ግብሮች' : 'Activities'}</a></li>
                                <li><Link to="/login" className="hover:text-blue-600">{lang === 'am' ? 'መግቢያ' : 'Login'}</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">{lang === 'am' ? 'አድራሻ' : 'Contact'}</h4>
                            <ul className="space-y-3 text-gray-600 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-blue-600 shrink-0" />
                                    <span>
                                        {lang === 'am'
                                            ? <>ደብረ ብርሃን<br />ቅዱስ ገብርኤል ቤተክርስቲያን ጀርባ</>
                                            : <>Debre Berhan<br />Behind St. Gabriel Church</>}
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users size={18} className="text-blue-600 shrink-0" />
                                    <span>+251 *** *** ***</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <p>
                            {lang === 'am'
                                ? `© ${new Date().getFullYear() - 8 + ((new Date().getMonth() > 8 || (new Date().getMonth() === 8 && new Date().getDate() >= 11)) ? 1 : 0)} ዓ.ም. ደብረ ብርሃን ጊቢ ጉባኤ። መብቱ በህግ የተጠበቀ ነው።`
                                : `© ${new Date().getFullYear()} Debre Berhan Gibi Gubae. All rights reserved.`}
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-blue-600">{lang === 'am' ? 'የግላዊነት መመሪያ' : 'Privacy Policy'}</a>
                            <a href="#" className="hover:text-blue-600">{lang === 'am' ? 'የአገልግሎት ውል' : 'Terms of Service'}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
