import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    ChevronRight, 
    Users, 
    BookOpen, 
    Heart, 
    Music, 
    Calendar, 
    MapPin, 
    Facebook, 
    Twitter, 
    Instagram, 
    ArrowRight,
    Cross,
    Shield
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
    useEffect(() => {
        const onScroll = () => {
            const s = window.scrollY > 10;
            if (s !== scrolled) setScrolled(s);
            setBgPosY(window.scrollY * 0.3);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [scrolled]);

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-white' : 'bg-transparent'}`}>
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <img src="/logo-mk.jpg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 leading-none">ደብረ ብርሀን</h1>
                                <p className="text-xs text-blue-600 font-medium tracking-widest">ግቢ ጉባኤ</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">ስለ እኛ</a>
                            <a href="#structure" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">መዋቅር</a>
                            <a href="#activities" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">መርሐ ግብሮች</a>
                            <Link to="/login" className="px-6 py-2.5 rounded-full bg-blue-900 text-white font-medium hover:bg-blue-800 transition-all transform hover:scale-105 shadow-lg shadow-gray-200">
                                መግቢያ
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('/hero_image.jpg')] bg-cover" style={{ backgroundPosition: `center ${-bgPosY}px` }} />
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
                                ተመስርቷል 1977 ዓ.ም.
                            </motion.div>
                            
                            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
                                መንፈሳዊ አንድነት በ<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">ዩኒቨርሲቲ</span>
                            </motion.h1>
                            
                            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                ለተማሪዎች መንፈሳዊ መጠለያ፣ በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ሥርዓት ላይ የተመሠረተ። "ትምህርትህ እምነትህን ያጠናክረው።"
                            </motion.p>
                            
                            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/register" className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group">
                                    ቤተሰብ ይሁኑ
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="#about" className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                                    ተጨማሪ ይወቁ
                                </a>
                            </motion.div>
                        </motion.div>

                        
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section id="about" className="py-20 bg-gray-50">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">ተልዕኳችን</h2>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">እምነትን በትምህርት ማሳደግ</h3>
                        <p className="text-gray-600 text-lg">
                            "ያለ መንፈሳዊ መሰረት ትምህርት በአሸዋ ላይ እንደተሰራ ቤት ነው።" — ቅዱስ ያሬድ። 
                            ተማሪዎች መንፈሳዊ ህይወታቸውን እንዲጠብቁ እና የቤተሰብነት ስሜት እንዲሰማቸው እንሰራለን።
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
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Structure Section */}
            <section id="structure" className="py-20 relative overflow-hidden">
                <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 mt-8">
                                    <div className="bg-blue-900 p-6 rounded-3xl text-white h-48 flex flex-col justify-end">
                                        <Music size={32} className="mb-4 text-blue-400" />
                                        <h4 className="text-xl font-bold">መዘምራን</h4>
                                        <p className="text-white/60 text-sm">ያሬዳዊ ዝማሬዎች</p>
                                    </div>
                                    <div className="bg-gray-100 p-6 rounded-3xl h-64 flex flex-col justify-end">
                                        <BookOpen size={32} className="mb-4 text-gray-400" />
                                        <h4 className="text-xl font-bold text-gray-900">መምህራን</h4>
                                        <p className="text-gray-500 text-sm">መንፈሳዊ ትምህርት</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-blue-600 p-6 rounded-3xl text-white h-64 flex flex-col justify-end">
                                        <Cross size={32} className="mb-4 text-white/80" />
                                        <h4 className="text-xl font-bold">ቅዱሳን ማህበራት</h4>
                                        <p className="text-white/80 text-sm">የቅዱሳን ህይወት</p>
                                    </div>
                                    <div className="bg-white border-2 border-dashed border-gray-200 p-6 rounded-3xl h-48 flex flex-col justify-center items-center text-center">
                                        <Users size={32} className="mb-2 text-gray-400" />
                                        <h4 className="text-lg font-bold text-gray-900">ምዕመናን</h4>
                                        <p className="text-gray-500 text-xs">የጉባኤው መሰረት</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="order-1 lg:order-2">
                            <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-3">መዋቅራችን</h2>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-6">ለመንፈሳዊ እድገት የተዋቀረ</h3>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                ማህበረሰባችን ሁለንተናዊ መንፈሳዊ ድጋፍ ለመስጠት የተዋቀረ ነው። ከመዘምራን እስከ መምህራን፣ እያንዳንዱ ክፍል የተማሪዎችን እምነት ለማጠናከር ያገለግላል።
                            </p>
                            <ul className="space-y-4">
                                {['ሥርዓተ ቅዳሴ', 'አጽዋማት', 'የጸሎት መርሐ ግብሮች', 'የማህበረሰብ አገልግሎት'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Weekly Activities */}
            <section id="activities" className="py-20 bg-blue-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/church.png')]"></div>
                <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-3">ይሳተፉ</h2>
                            <h3 className="text-3xl md:text-4xl font-extrabold">ሳምንታዊ መርሐ ግብሮች</h3>
                        </div>
                        <Link to="/register" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-white transition-colors font-bold">
                            ሙሉ መርሐ ግብር ይመልከቱ <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "የጥምቀት በዓል",
                                sub: "ዓመታዊ በዓል",
                                desc: "የጌታችን ኢየሱስ ክርስቶስን ጥምቀት በድምቀት ማክበር።",
                                color: "bg-blue-600"
                            },
                            {
                                title: "የጸሎት ሥርዓት",
                                sub: "ዕለታዊ",
                                desc: "ከጥንታዊ ሥርዓታችን ጋር የሚያገናኘን የጸሎት ጊዜ።",
                                color: "bg-blue-500"
                            },
                            {
                                title: "መዝሙር ጥናት",
                                sub: "ሳምንታዊ",
                                desc: "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ዝማሬዎችን መማር እና ማቅረብ።",
                                color: "bg-blue-400"
                            },
                            {
                                title:"የሂዎት ት/ት",
                                sub: "ሳምንታዊ",
                                desc: "ሙሉ ከርስቶስን የምንማርበት",
                                color: "bg-blue-400"
                            },
                              {
                                title:"የሂዎት ት/ት",
                                sub: "ሳምንታዊ",
                                desc: "ሙሉ ከርስቶስን የምንማርበት",
                                color: "bg-blue-400"
                            },
                              {
                                title:"የሂዎት ት/ት",
                                sub: "ሳምንታዊ",
                                desc: "ሙሉ ከርስቶስን የምንማርበት",
                                color: "bg-blue-400"
                            },
                              {
                                title:"የሂዎት ት/ት",
                                sub: "ሳምንታዊ",
                                desc: "ሙሉ ከርስቶስን የምንማርበት",
                                color: "bg-blue-400"
                            },  {
                                title:"የሂዎት ት/ት",
                                sub: "ሳምንታዊ",
                                desc: "ሙሉ ከርስቶስን የምንማርበት",
                                color: "bg-blue-400"
                            }

                        ].map((activity, idx) => (
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
                                <span className="text-xl font-bold text-gray-900">ደብረ ብርሀን ጊቢ ጉባኤ</span>
                            </div>
                            <p className="text-gray-500 mb-6 max-w-sm">
                                የተማሪዎችን እምነት የሚያጎለብት ንቁ መንፈሳዊ ማህበረሰብ መፍጠር።
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Twitter size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <Instagram size={18} />
                                </a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">ፈጣን አገናኞች</h4>
                            <ul className="space-y-3 text-gray-600 text-sm">
                                <li><a href="#" className="hover:text-blue-600">ስለ እኛ</a></li>
                                <li><a href="#" className="hover:text-blue-600">መዋቅር</a></li>
                                <li><a href="#" className="hover:text-blue-600">መርሐ ግብሮች</a></li>
                                <li><Link to="/login" className="hover:text-blue-600">መግቢያ</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">አድራሻ</h4>
                            <ul className="space-y-3 text-gray-600 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin size={18} className="text-blue-600 shrink-0" />
                                    <span>ደብረ ብርሀን<br />ቅዱስ ገብርኤል ቤተክርስቲያን ጀርባ</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Users size={18} className="text-blue-600 shrink-0" />
                                    <span>+251 951 21 911</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <p>© 2018 ዓ.ም. ደብረ ብርሀን ጊቢ ጉባኤ። መብቱ በህግ የተጠበቀ ነው።</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-blue-600">የግላዊነት መመሪያ</a>
                            <a href="#" className="hover:text-blue-600">የአገልግሎት ውል</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
