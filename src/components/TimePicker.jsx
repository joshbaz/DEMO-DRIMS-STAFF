import React from 'react';

const TimePicker = ({ value, onChange, required }) => {
  // Generate time options in 15-minute intervals from 7:00 AM to 8:00 PM
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 7; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 20 && m > 0) continue; // Stop at 8:00 PM

        const hour24 = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        const value24 = `${hour24}:${minute}`;

        let displayHour = h % 12;
        displayHour = displayHour ? displayHour : 12;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayLabel = `${displayHour}:${minute} ${ampm}`;

        options.push({ value: value24, label: displayLabel });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="" disabled>Select time</option>
      {timeOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default TimePicker;
