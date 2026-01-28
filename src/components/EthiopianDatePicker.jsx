import React, { useEffect, useState } from 'react';
import { toEthiopian, toGregorian, ETHIOPIAN_MONTHS, ETHIOPIAN_MONTHS_AMHARIC } from '../utils/ethiopianDateUtils';
import { Calendar } from 'lucide-react';

const EthiopianDatePicker = ({ value, onChange, className = "" }) => {
    // Default to a recent date if value is missing
    const [ethDate, setEthDate] = useState({ year: 2017, month: 1, day: 1 });

    useEffect(() => {
        if (value) {
            try {
                // Ensure value is a valid date string
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
        
        // Pagume validation: if month changes to 13, cap day at 6
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

    // Generate years dynamically (e.g., current Eth year - 80 to + 5 for birthdates or events)
    const currentEthYear = toEthiopian(new Date()).year;
    const years = Array.from({ length: 100 }, (_, i) => currentEthYear - 80 + i);
    
    // Determine max days for the currently selected month
    const maxDays = ethDate.month === 13 ? 6 : 30;
    const days = Array.from({ length: maxDays }, (_, i) => i + 1);

    return (
        <div className={`flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm ${className}`}>
            <Calendar size={18} className="text-church-red" />
            <div className="flex gap-2">
                 <select 
                    value={ethDate.day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer p-1"
                >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select 
                    value={ethDate.month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer p-1"
                >
                    {ETHIOPIAN_MONTHS_AMHARIC.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                    ))}
                </select>

                <select 
                    value={ethDate.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer p-1"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    );
};

export default EthiopianDatePicker;
