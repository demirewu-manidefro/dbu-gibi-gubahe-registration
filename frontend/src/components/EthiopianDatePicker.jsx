
import React, { useEffect, useState } from 'react';
import { toEthiopian, toGregorian, ETHIOPIAN_MONTHS, ETHIOPIAN_MONTHS_AMHARIC } from '../utils/ethiopianDateUtils';
import { Calendar } from 'lucide-react';

const EthiopianDatePicker = ({ value, onChange, className = "", minYear, maxYear }) => {
    const [ethDate, setEthDate] = useState({ year: toEthiopian(new Date()).year, month: toEthiopian(new Date()).month, day: toEthiopian(new Date()).day });

    useEffect(() => {
        if (value) {
            try {

                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    const eth = toEthiopian(date);
                    setEthDate(eth);
                }
            } catch (e) {
                console.error("Invalid date prop", e);
            }
        }
    }, [value]);

    const handleChange = (field, val) => {
        const newEthDate = { ...ethDate, [field]: parseInt(val) };

        if (newEthDate.month === 13 && newEthDate.day > 6) {
            newEthDate.day = 1;
        }

        setEthDate(newEthDate);

        try {
            const greg = toGregorian(newEthDate.year, newEthDate.month, newEthDate.day);
            const year = greg.getFullYear();
            const month = String(greg.getMonth() + 1).padStart(2, '0');
            const day = String(greg.getDate()).padStart(2, '0');
            // Notify parent with YYYY-MM-DD
            onChange(`${year}-${month}-${day}`);
        } catch (e) {
            console.error("Date conversion error", e);
        }
    };

    const currentEthYear = toEthiopian(new Date()).year;

    let years;
    if (minYear && maxYear) {
        years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    } else {
        years = Array.from({ length: 100 }, (_, i) => currentEthYear - 80 + i);
    }

    const maxDays = ethDate.month === 13 ? 6 : 30;
    const days = Array.from({ length: maxDays }, (_, i) => i + 1);

    return (
        <div className={`flex items-center gap-2 bg-white dark:bg-gray-700 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm ${className}`}>
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            <div className="flex gap-2">
                <select
                    value={ethDate.day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    className="bg-transparent font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer p-1 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                    value={ethDate.month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    className="bg-transparent font-bold text-gray-900 dark:text-white outline-none cursor-pointer p-1 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                >
                    {ETHIOPIAN_MONTHS_AMHARIC.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                    ))}
                </select>

                <select
                    value={ethDate.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    className="bg-transparent font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer p-1 [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:bg-gray-700 dark:[&>option]:text-white"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    );
};

export default EthiopianDatePicker;
