export const normalizeStudent = (s) => {
    if (!s) return null;
    const parse = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        if (typeof val === 'object' && val !== null) return val;
        return {};
    };

    let schoolInfo = parse(s.school_info || s.schoolInfo);
    let otherLanguages = parse(s.other_languages || s.otherLanguages);
    let teacherTrainingRaw = parse(s.teacher_training || s.teacherTraining || schoolInfo.teacher_training || schoolInfo.teacherTraining);
    let leadershipTrainingRaw = parse(s.leadership_training || s.leadershipTraining || schoolInfo.leadership_training || schoolInfo.leadershipTraining);

    const normalizeTraining = (t) => ({
        level1: t?.level1 || t?.['1'] || '',
        level2: t?.level2 || t?.['2'] || '',
        level3: t?.level3 || t?.['3'] || ''
    });

    let teacherTraining = normalizeTraining(teacherTrainingRaw);
    let leadershipTraining = normalizeTraining(leadershipTrainingRaw);

    let participation = parse(s.responsibility || s.participation || schoolInfo.responsibility || schoolInfo.participation);
    let attendance = parse(s.attendance || s.attendance_yearly || schoolInfo.attendance || schoolInfo.attendance_yearly);
    let educationYearlyRaw = parse(s.education_yearly || s.educationYearly || schoolInfo.education_yearly || schoolInfo.educationYearly || s.courses || schoolInfo.courses || s.education || schoolInfo.education);

    const normalizeYearly = (e) => {
        if (typeof e === 'string' && e.trim().length > 0 && !e.startsWith('{')) {
            return { y1: e, y2: '', y3: '', y4: '', y5: '', y6: '' };
        }
        return {
            y1: e?.y1 || e?.['1'] || e?.[0] || '',
            y2: e?.y2 || e?.['2'] || e?.[1] || '',
            y3: e?.y3 || e?.['3'] || e?.[2] || '',
            y4: e?.y4 || e?.['4'] || e?.[3] || '',
            y5: e?.y5 || e?.['5'] || e?.[4] || '',
            y6: e?.y6 || e?.['6'] || e?.[5] || ''
        };
    };

    let educationYearly = normalizeYearly(educationYearlyRaw);
    let gpa = parse(s.gpa || schoolInfo.gpa || { y1: '', y2: '', y3: '', y4: '', y5: '', y6: '' });
    let abinetEducation = s.abinet_education || s.abinetEducation || schoolInfo.abinetEducation || '';
    let specialNeed = s.special_need || s.specialNeed || schoolInfo.specialNeed || '';

    let birthYear = s.birthYear || s.birth_year;
    if (!birthYear && s.birth_date) {
        const date = new Date(s.birth_date);
        if (!isNaN(date.getTime())) {
            birthYear = date.getFullYear();
        } else {
            birthYear = s.birth_date;
        }
    }

    return {
        ...s,
        id: s.id || s.student_id || s.studentId,
        name: s.full_name || s.fullName || s.name,
        sex: s.gender || s.sex,
        age: s.age,
        birthYear: birthYear,
        baptismalName: s.baptismal_name || s.baptismalName,
        priesthoodRank: s.priesthood_rank || s.priesthoodRank,
        motherTongue: s.mother_tongue || s.motherTongue,
        otherLanguages: otherLanguages,
        region: s.region,
        zone: s.zone,
        woreda: s.woreda,
        kebele: s.kebele,
        phone: s.phone,
        centerAndWoredaCenter: s.center_and_woreda || s.centerAndWoredaCenter,
        gibiName: s.gibi_name || s.gibiName,
        emergencyName: s.emergency_name || s.emergencyName,
        emergencyPhone: s.emergency_phone || s.emergencyPhone,
        parishChurch: s.parish_church || s.parishChurch,
        section: s.service_section || s.section,
        specialEducation: s.special_education || s.specialEducation || schoolInfo.specialEducation,

        dept: s.department || s.dept,
        year: s.batch || s.year,
        graduationYear: s.graduation_year || s.graduationYear || schoolInfo.graduation_year || schoolInfo.graduationYear,
        cumulativeGPA: s.cumulative_gpa || s.cumulativeGPA || schoolInfo.cumulativeGPA,
        membershipYear: s.membership_year || s.membershipYear || schoolInfo.membershipYear,
        photoUrl: s.photo_url || s.photoUrl,
        traineeType: s.trainee_type || s.traineeType,
        gpa: gpa,
        participation: participation,
        responsibility: s.responsibility || participation,
        teacherTraining: teacherTraining,
        leadershipTraining: leadershipTraining,
        otherTrainings: s.other_trainings || s.otherTrainings,
        additionalInfo: s.additional_info || s.additionalInfo,
        filledBy: s.filled_by || s.filledBy,
        verifiedBy: s.verified_by || s.verifiedBy,
        submissionDate: s.created_at || s.submissionDate,
        attendance: attendance,
        educationYearly: educationYearly,
        abinetEducation: abinetEducation,
        specialNeed: specialNeed,
        username: s.username
    };
};
