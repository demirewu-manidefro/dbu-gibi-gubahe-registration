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

export const formatEthiopianTime = (dateOrIsoString) => {
    if (!dateOrIsoString) return '';
    try {
        const date = new Date(dateOrIsoString);
        let hours = date.getHours();
        const minutes = date.getMinutes();

        // Ethiopian time starts at 6 AM (Western) which is 12:00 (Ethiopian)
        // 7 AM Western = 01:00 Ethiopian
        // 6 PM Western = 12:00 Ethiopian (Night)
        // 7 PM Western = 01:00 Ethiopian (Night)

        let ethHours = (hours - 6 + 24) % 12;
        if (ethHours === 0) ethHours = 12;

        const amharicTimeOfDay = hours >= 6 && hours < 18 ? 'ቀን' : 'ማታ';
        // Finer labels could be used (ማለዳ, ረፋድ, ወዘተ) but ቀን/ማታ is standard

        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedHours = ethHours < 10 ? `0${ethHours}` : ethHours;

        return `${amharicTimeOfDay} ${formattedHours}:${formattedMinutes}`;
    } catch (e) {
        return '';
    }
};
