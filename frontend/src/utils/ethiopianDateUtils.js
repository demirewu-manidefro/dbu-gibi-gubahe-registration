import { EthDateTime } from 'ethiopian-calendar-date-converter';

export const ETHIOPIAN_MONTHS = [
    "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
    "Megabit", "Miyazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

export const ETHIOPIAN_MONTHS_AMHARIC = [
    "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት",
    "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

export const toEthiopian = (date) => {
    const eth = EthDateTime.fromEuropeanDate(date);
    return {
        year: eth.year,
        month: eth.month,
        day: eth.date
    };
};

export const toGregorian = (year, month, day) => {
    return new EthDateTime(year, month, day).toEuropeanDate();
};

export const getCurrentEthiopianDate = () => {
    const now = new Date();
    return toEthiopian(now);
};

export const formatEthiopianDate = (dateOrIsoString) => {
    if (!dateOrIsoString) return '';
    try {
        const date = new Date(dateOrIsoString);
        const eth = toEthiopian(date);
        return `${ETHIOPIAN_MONTHS[eth.month - 1]} ${eth.day}, ${eth.year}`;
    } catch (e) {
        return '';
    }
};

export const formatEthiopianDateAmharic = (dateOrIsoString) => {
    if (!dateOrIsoString) return '';
    try {
        const date = new Date(dateOrIsoString);
        const eth = toEthiopian(date);
        return `${ETHIOPIAN_MONTHS_AMHARIC[eth.month - 1]} ${eth.day}, ${eth.year}`;
    } catch (e) {
        return '';
    }
};

export const ethiopianToGregorian = (year, month, day) => {
    return toGregorian(parseInt(year), parseInt(month), parseInt(day));
};
