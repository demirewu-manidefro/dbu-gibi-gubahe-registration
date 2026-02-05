import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/auth';
import {
    Image as ImageIcon,
    Upload,
    Plus,
    X,
    Calendar,
    Trash2,
    Search,
    Filter,
    History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
    const { gallery, uploadGalleryItem, deleteGalleryItem, user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('All');

    const getEthiopianYear = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        if (month < 9 || (month === 9 && day < 11)) return year - 8;
        return year - 7;
    };

    const CURRENT_ETHIOPIAN_YEAR = getEthiopianYear();

    // Upload state
    const [newImageData, setNewImageData] = useState({
        title: '',
        description: '',
        year: CURRENT_ETHIOPIAN_YEAR,
        image_url: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const isManager = user?.role === 'manager';

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setNewImageData({ ...newImageData, image_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newImageData.image_url || !newImageData.year) return;
        if (parseInt(newImageData.year) > CURRENT_ETHIOPIAN_YEAR) {
            alert(`የመመዝገቢያ አመት ከ ${CURRENT_ETHIOPIAN_YEAR} መብለጥ አይችልም`);
            return;
        }

        setLoading(true);
        try {
            await uploadGalleryItem(newImageData);
            setIsUploading(false);
            setNewImageData({ title: '', description: '', year: CURRENT_ETHIOPIAN_YEAR, image_url: '' });
            setImagePreview(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('ይህንን ምስል መሰረዝ ይፈልጋሉ?')) {
            try {
                await deleteGalleryItem(id);
            } catch (err) {
                alert('ስረዛው አልተሳካም');
            }
        }
    };

    // Filter and Group Logic
    const availableYears = useMemo(() => {
        const years = ['All', ...new Set(gallery.map(item => item.year.toString()))];
        return years.sort((a, b) => b - a);
    }, [gallery]);

    const filteredGallery = gallery.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.year.toString().includes(searchTerm);
        const matchesYear = selectedYear === 'All' || item.year.toString() === selectedYear;
        return matchesSearch && matchesYear;
    });

    // Grouping by year for the display
    const groupedGallery = useMemo(() => {
        const groups = {};
        filteredGallery.forEach(item => {
            if (!groups[item.year]) groups[item.year] = [];
            groups[item.year].push(item);
        });
        return groups;
    }, [filteredGallery]);

    const sortedYears = Object.keys(groupedGallery).sort((a, b) => b - a);

    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Full Image Lightbox - Moved to Top for Stacking Precedence */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[9999] flex items-center justify-center cursor-zoom-out p-4"
                    >
                        <button
                            className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-red-600 rounded-full text-white transition-all shadow-2xl z-[10000]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <X size={32} strokeWidth={3} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-full max-h-full flex items-center justify-center pointer-events-auto"
                        >
                            <img
                                src={selectedImage.image_url}
                                alt=""
                                className="max-w-[98vw] max-h-[98vh] object-contain rounded-xl shadow-2xl transition-all"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-blue-900 tracking-tight mb-1">የምስል ማህደር</h1>
                    <p className="text-blue-600/60 font-medium text-sm">ታሪካዊ የሆኑ የጉባኤው ትውስታዎች</p>
                </div>
                {isManager && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsUploading(true)}
                        className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-800 transition-all shadow-lg whitespace-nowrap"
                    >
                        <Plus size={24} strokeWidth={2.5} />
                        ምስል ጨምር
                    </motion.button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-blue-50 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ትውስታዎችን ይፈልጉ..."
                        className="pl-12 h-14 bg-blue-50/20 border-transparent focus:border-blue-100 rounded-2xl w-full text-blue-900 font-medium transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 bg-blue-50/20 rounded-2xl px-5 h-14">
                    <Filter size={18} className="text-blue-400" />
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">ዓመት</span>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold text-blue-900 focus:ring-0 p-0 pr-8 cursor-pointer"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year === 'All' ? 'ሁሉም ማህደር' : `${year} ዓ.ም`}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Gallery Content */}
            {sortedYears.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-blue-50">
                    <History size={48} className="mx-auto text-blue-100 mb-6" />
                    <h3 className="text-xl font-bold text-blue-900/30">ምንም ምስሎች አልተገኙም</h3>
                </div>
            ) : (
                <div className="space-y-16">
                    {sortedYears.map(year => (
                        <div key={year} className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-900 text-white px-6 py-2 rounded-xl shadow-md">
                                    <h2 className="text-xl font-black">{year} <span className="text-xs font-medium opacity-60 ml-1">ዓ.ም</span></h2>
                                </div>
                                <div className="h-[2px] flex-1 bg-blue-50"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {groupedGallery[year].map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -12, scale: 1.02 }}
                                        onClick={() => setSelectedImage(item)}
                                        transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                                        className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_10px_30px_-15px_rgba(30,58,138,0.2)] hover:shadow-[0_20px_50px_-10px_rgba(30,58,138,0.3)] transition-all cursor-zoom-in"
                                    >
                                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Found';
                                                }}
                                            />

                                            {/* Delete Button - Red BG */}
                                            {isManager && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(item.id);
                                                    }}
                                                    className="absolute top-3 right-3 bg-red-600 text-white p-3 rounded-2xl shadow-xl hover:bg-black hover:scale-110 transition-all z-30 group/del"
                                                >
                                                    <Trash2 size={20} strokeWidth={3} className="group-hover/del:rotate-12" />
                                                </button>
                                            )}

                                            {/* Year Overlay */}
                                            <div className="absolute top-3 left-3 pointer-events-none">
                                                <div className="bg-white/90 backdrop-blur-md text-blue-900 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white">
                                                    {year} ዓ.ም
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description with Vibrant Blue Gradient Background */}
                                        <div className="bg-gradient-to-br from-blue-200 to-blue-600 pb-0 pt-0 text-center group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-500">
                                            <h4 className="font-extrabold text-white truncate text-base tracking-tight drop-shadow-sm">{item.title || 'Sacred Memory'}</h4>
                                            {item.description && (
                                                <p className="text-white/70 text-[10px] mt-1 line-clamp-2 font-medium leading-tight">
                                                    {item.description}
                                                </p>
                                            )}
                                            <div className="h-1 w-10 bg-white/20 mx-auto rounded-full mt-3 group-hover:w-20 group-hover:bg-white/40 transition-all duration-700"></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <button
                                    onClick={() => {
                                        setIsUploading(false);
                                        setImagePreview(null);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Upload size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">ምስል ይሙሉ</h2>
                                    <p className="text-sm text-gray-500">ፎቶ ወደ ማህደር ጨምር (ያለፈውን እና አሁን)</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                {/* Image Upload Area */}
                                <div className="flex flex-col items-center">
                                    <div className="w-full aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-all">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="text-center">
                                                <ImageIcon size={48} className="mx-auto text-gray-300 mb-2" />
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">ምስል ይምረጡ</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">የምስሉ ርዕስ</label>
                                        <input
                                            type="text"
                                            required
                                            value={newImageData.title}
                                            onChange={(e) => setNewImageData({ ...newImageData, title: e.target.value })}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400 h-12"
                                            placeholder="ምሳሌ፡ የፋሲካ በአል አከባበር"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">ዓመት (ዓ.ም)</label>
                                        <input
                                            type="number"
                                            required
                                            max={CURRENT_ETHIOPIAN_YEAR}
                                            value={newImageData.year}
                                            onChange={(e) => setNewImageData({ ...newImageData, year: e.target.value })}
                                            className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400 h-12"
                                            placeholder="2017"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">ዝርዝር መግለጫ</label>
                                    <textarea
                                        value={newImageData.description}
                                        onChange={(e) => setNewImageData({ ...newImageData, description: e.target.value })}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl focus:ring-blue-400 focus:border-blue-400 p-3 h-24 resize-none"
                                        placeholder="ስለዚህ ምስል ተጨማሪ ዝርዝሮችን ያክሉ..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            ወደ ማህደር አክል
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Gallery;
