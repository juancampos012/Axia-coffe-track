import React from 'react';

interface ToggleSwitchProps {
  options: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  options, 
  activeIndex, 
  onChange 
}) => {
  return (
    <div className="bg-gray-800 p-1 rounded-full inline-flex">
      {options.map((option, index) => (
        <button
          key={option}
          onClick={() => onChange(index)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            activeIndex === index
              ? 'bg-gray-700 text-white'
              : 'text-gray-500 hover:text-white'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};