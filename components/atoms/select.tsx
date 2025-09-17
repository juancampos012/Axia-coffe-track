import React from 'react';

interface SelectProps {
  className?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  [key: string]: any;
}

const Select: React.FC<SelectProps> = ({ className, options, placeholder, ...props }) => (
  <select
    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 appearance-none bg-black text-gray-500 ${className}`}
    {...props}
  >
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default Select;