import React from 'react';
import { X } from 'lucide-react';
import { toEthiopian } from '../utils/ethiopianDateUtils';
import { useAuth } from '../context/auth'; // Ensure useAuth is imported if needed for user role checks inside modal

const ViewStudentModal = ({ student, onClose, title = 'የተማሪ መረጃ' }) => {
    const { user } = useAuth(); // Get current user for role check (admin/manager view options)

    // Helper functions specific to this view
    const getPriesthoodLabel = (rank) => {
        const labels = { 'mimen': 'ምእመን', 'diakon': 'ዲያቆን', 'kahin': 'ካህን' };
        return labels[rank] || rank || '';
    };

    const formatEthDate = (dateVal) => {
        if (!dateVal) return '-';
        try {
            const date = new Date(dateVal);
            if (isNaN(date.getTime())) return dateVal; // Return original if not a valid date
            const eth = toEthiopian(date);
            return `${eth.day}/${eth.month}/${eth.year}`;
        } catch (e) {
            return dateVal;
        }
    };

    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-8">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{student.id}</div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {/* Header Section with Photo */}
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 overflow-hidden flex-shrink-0">
                            {student.photoUrl ? (
                                <img src={student.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                                    {student.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
                            <div className="text-base text-gray-500 dark:text-gray-400 font-medium">{student.id}</div>
                            {student.username && (
                                <div className="text-sm text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded w-fit my-1">
                                    @{student.username}
                                </div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {student.sex}
                                </span>
                                {student.status && (
                                    <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {student.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-blue-500">#</span> የግል መረጃ
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">እድሜ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.age || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የልደት ዘመን</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{student.birthYear || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የአፍ መፍቻ ቋንቋ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.motherTongue || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ሌሎች ቋንቋዎች</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">
                                        {[
                                            student.otherLanguages?.l1,
                                            student.otherLanguages?.l2,
                                            student.otherLanguages?.l3
                                        ].filter(Boolean).join(', ') || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spiritual Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-purple-500">†</span> መንፈሳዊ መረጃ
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div className="col-span-2">
                                    <div className="text-xs text-gray-400 font-bold uppercase">የክርስትና ስም</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.baptismalName || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">መንፈሳዊ ማዕረግ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{getPriesthoodLabel(student.priesthoodRank) || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የአገልግሎት ክፍል</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.section || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Address & Contact */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-emerald-500">@</span> አድራሻ እና እውቅያ
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ስልክ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.phone || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ክልል</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.region || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ዞን</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.zone || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ወረዳ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.woreda || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ቀበሌ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.kebele || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">ማእከል</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.centerAndWoredaCenter || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Gibi & Emergency */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-orange-500">⚠</span> አደጋ ጊዜ እና ግቢ
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የግቢ ስም</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.gibiName || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">አጥቢያ ቤተክርስቲያን</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.parishChurch || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የተጠሪ ስም</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.emergencyName || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የተጠሪ ስልክ</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.emergencyPhone || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-blue-600">🎓</span> ትምህርት
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 text-sm">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የትምህርት ክፍል</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.dept || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የምረቃ ዓመት / ባች</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.year || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">የሚመረቁበት ዓመት</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.graduationYear || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">አባል የሆኑበት ዓመት</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.membershipYear || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase">አጠቃላይ ውጤት (GPA)</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-200">{student.cumulativeGPA || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Yearly Matrix */}
                        <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-indigo-500">📊</span> ዓመታዊ መዛግብት
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border border-gray-200 dark:border-slate-600 rounded-lg">
                                    <thead className="bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-bold text-xs uppercase">
                                        <tr>
                                            <th className="px-3 py-2 border-r border-b dark:border-slate-600">ዓመት</th>
                                            <th className="px-3 py-2 border-r border-b dark:border-slate-600">GPA</th>
                                            <th className="px-3 py-2 border-r border-b dark:border-slate-600">የአገልግሎት ክፍልና ሃላፊነት</th>
                                            <th className="px-3 py-2 border-r border-b dark:border-slate-600">ክትትል</th>
                                            <th className="px-3 py-2 border-b dark:border-slate-600">ትምህርት</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                        {[1, 2, 3, 4, 5, 6].map(year => (
                                            <tr key={year} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
                                                <td className="px-3 py-2 border-r dark:border-slate-600 font-medium text-gray-500 dark:text-gray-300">Year {year}</td>
                                                <td className="px-3 py-2 border-r dark:border-slate-600 text-gray-700 dark:text-gray-300">{student.gpa?.[`y${year}`] || '-'}</td>
                                                <td className="px-3 py-2 border-r dark:border-slate-600 text-gray-700 dark:text-gray-300">{(student.responsibility?.[`y${year}`]) || (student.participation?.[`y${year}`]) || '-'}</td>
                                                <td className="px-3 py-2 border-r dark:border-slate-600 text-gray-700 dark:text-gray-300">{student.attendance?.[`y${year}`] || '-'}</td>
                                                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{student.educationYearly?.[`y${year}`] || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Trainings */}
                        <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-2 flex items-center gap-2">
                                <span className="text-rose-500">🎖</span> ስልጠናዎች እና ሌሎች
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2">
                                    <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">የመምህር ስልጠና</div>
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                            <span className="text-gray-500 dark:text-gray-400">ደረጃ 1</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{student.teacherTraining?.level1 || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                            <span className="text-gray-500 dark:text-gray-400">ደረጃ 2</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{student.teacherTraining?.level2 || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">ደረጃ 3</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{student.teacherTraining?.level3 || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2">
                                    <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">የአመራር ስልጠና</div>
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                            <span className="text-gray-500 dark:text-gray-400">ደረጃ 1</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{student.leadershipTraining?.level1 || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-b border-gray-100 dark:border-slate-600 pb-1">
                                            <span className="text-gray-500 dark:text-gray-400">ደረጃ 2</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{student.leadershipTraining?.level2 || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">ደረጃ 3</span>
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{student.leadershipTraining?.level3 || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Other Trainings</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{student.otherTrainings || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Abinet Education</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{student.abinetEducation || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Special Need</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{student.specialNeed || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-200 font-bold uppercase">Additional Info</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{student.additionalInfo || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 border-t border-gray-100 pt-4 flex flex-wrap gap-8 text-xs text-gray-400">
                            <div>
                                <span className="font-bold uppercase mr-2">Filled By:</span>
                                {student.filledBy || '-'}
                            </div>
                            <div>
                                <span className="font-bold uppercase mr-2">Verified By:</span>
                                {student.verifiedBy || '-'}
                            </div>
                            <div>
                                <span className="font-bold uppercase mr-2">Submission Date:</span>
                                {formatEthDate(student.submissionDate)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStudentModal;
