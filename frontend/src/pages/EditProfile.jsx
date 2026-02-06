import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/auth';
import RegistrationForm from '../components/RegistrationForm';
import ViewStudentModal from '../components/ViewStudentModal';
import { normalizeStudent } from '../utils/studentUtils';
import { Contact } from 'lucide-react';

const EditProfile = () => {
    const { updateStudent, user: sessionUser, students } = useAuth();
    const [showView, setShowView] = useState(false);

    // Use student record if available, fallback to session user
    const admin = students?.find(s => s.username === sessionUser?.username) || sessionUser;

    const getVal = (paths, defaultValue = '') => {
        if (!admin) return defaultValue;
        for (const path of paths) {
            let current = admin;
            const parts = path.split('.');
            for (const part of parts) {
                current = current ? current[part] : undefined;
            }
            if (current !== undefined && current !== null) return current;
        }
        return defaultValue;
    };

    const safeParse = (val, defaultValue) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { console.error("Error parsing JSON:", e); return defaultValue; }
        }
        return val || defaultValue;
    };

    const initialData = useMemo(() => {
        if (!admin) return null;

        return {
            studentId: getVal(['id', 'student_id']),
            fullName: getVal(['name', 'full_name']),
            sex: getVal(['sex', 'gender']),
            birthYear: getVal(['birthYear', 'birth_date']),
            age: getVal(['age']),
            baptismalName: getVal(['baptismalName', 'baptismal_name']),
            priesthoodRank: getVal(['priesthoodRank', 'priesthood_rank']),
            profilePhoto: null, // File object, null initially
            photoUrl: getVal(['photoUrl', 'photo_url']),
            motherTongue: getVal(['motherTongue', 'mother_tongue']),

            otherLanguages: safeParse(getVal(['otherLanguages', 'other_languages']), { l1: '', l2: '', l3: '' }),

            phone: getVal(['phone']),
            region: getVal(['region']),
            zone: getVal(['zone']),
            woreda: getVal(['woreda']),
            kebele: getVal(['kebele']),
            gibiName: getVal(['gibiName', 'gibi_name']),
            centerAndWoredaCenter: getVal(['centerAndWoredaCenter', 'center_and_woreda']),
            parishChurch: getVal(['parishChurch', 'parish_church']),
            emergencyName: getVal(['emergencyName', 'emergency_name']),
            emergencyPhone: getVal(['emergencyPhone', 'emergency_phone']),

            department: getVal(['dept', 'department']),
            batch: getVal(['year', 'batch']),
            college: getVal(['college']),

            gpa: safeParse(getVal(['gpa', 'school_info.gpa']), { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
            cumulativeGPA: getVal(['cumulativeGPA', 'school_info.cumulativeGPA']),

            serviceSection: getVal(['section', 'service_section']),
            graduationYear: getVal(['graduationYear', 'graduation_year']),
            membershipYear: getVal(['membershipYear', 'school_info.membershipYear']),

            responsibility: safeParse(getVal(['responsibility', 'participation', 'school_info.responsibility', 'school_info.participation']), { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
            teacherTraining: safeParse(getVal(['teacherTraining', 'teacher_training']), { level1: '', level2: '', level3: '' }),
            leadershipTraining: safeParse(getVal(['leadershipTraining', 'leadership_training']), { level1: '', level2: '', level3: '' }),

            otherTrainings: getVal(['otherTrainings', 'other_trainings']),
            additionalInfo: getVal(['additionalInfo', 'additional_info']),
            filledBy: getVal(['filledBy', 'filled_by']),
            verifiedBy: getVal(['verifiedBy', 'verified_by']),
            submissionDate: getVal(['submissionDate', 'submission_date']),

            attendance: safeParse(getVal(['attendance', 'school_info.attendance']), { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
            educationYearly: safeParse(getVal(['educationYearly', 'school_info.educationYearly']), { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' }),
            abinetEducation: getVal(['abinetEducation', 'school_info.abinetEducation']),
            specialNeed: getVal(['specialNeed', 'school_info.specialNeed']),

            username: getVal(['username']),
        };
    }, [admin]);

    const handleEditSubmit = async (data) => {
        const schoolInfo = {
            gpa: data.gpa,
            responsibility: data.responsibility,
            attendance: data.attendance,
            educationYearly: data.educationYearly,
            abinetEducation: data.abinetEducation,
            specialNeed: data.specialNeed,
            cumulativeGPA: data.cumulativeGPA,
            membershipYear: data.membershipYear
        };

        const updatedData = {
            ...data,

            mother_tongue: data.motherTongue,
            other_languages: data.otherLanguages,
            center_and_woreda: data.centerAndWoredaCenter,
            parish_church: data.parishChurch,
            emergency_name: data.emergencyName,
            emergency_phone: data.emergencyPhone,

            priesthood_rank: data.priesthoodRank,
            baptismal_name: data.baptismalName,

            service_section: data.serviceSection,
            graduation_year: data.graduationYear,

            teacher_training: data.teacherTraining,
            leadership_training: data.leadershipTraining,
            other_trainings: data.otherTrainings,

            additional_info: data.additionalInfo,
            filled_by: data.filledBy,
            verified_by: data.verifiedBy,
            submission_date: data.submissionDate,

            school_info: schoolInfo,

            photo_url: data.photoUrl
        };

        await updateStudent(data.studentId, updatedData);
    };

    if (!admin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <RegistrationForm
                initialData={initialData}
                onSubmit={handleEditSubmit}
                title={['admin', 'manager'].includes(sessionUser?.role) ? "የአድሚኑ መረጃ ማስተካከያ" : "የግል መረጃ ማስተካከያ"}
                headerAction={
                    <button
                        onClick={() => setShowView(true)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-700 group"
                        title="View Full Details"
                    >
                        <Contact size={22} className="group-hover:scale-110 transition-transform" />
                    </button>
                }
            />
            {showView && (
                <ViewStudentModal
                    student={normalizeStudent(admin)}
                    onClose={() => setShowView(false)}
                    title={['admin', 'manager'].includes(sessionUser?.role) ? "የአድሚኑ መረጃ" : "የተማሪ መረጃ"}
                />
            )}
        </>
    );
};

export default EditProfile;
