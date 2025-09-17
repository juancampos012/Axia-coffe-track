import React from 'react';

interface ButtonProps {
  text: string;
  primary?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  text, 
  primary = false, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-md transition-colors ${
        primary 
          ? 'bg-homePrimary  hover:bg-primary text-white' 
          : 'bg-homePrimary hover:bg-primary text-white'
      }`}
    >
      {text}
    </button>
  );
};