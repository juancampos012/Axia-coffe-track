import React from 'react';

interface SelectProps {
  className?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  [key: string]: any;
}

const Select: React.FC<SelectProps> = ({ className, options, placeholder, ...props }) => (
  <select
    className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer ${className ?? ''}`}
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(30,60,139,0.35)",
      color: "rgba(255,255,255,0.7)",
    }}
    {...props}
  >
    {placeholder && (
      <option value="" disabled style={{ background: "#0a1120" }}>
        {placeholder}
      </option>
    )}
    {options.map((option) => (
      <option key={option.value} value={option.value} style={{ background: "#0a1120", color: "white" }}>
        {option.label}
      </option>
    ))}
  </select>
);

export default Select;
