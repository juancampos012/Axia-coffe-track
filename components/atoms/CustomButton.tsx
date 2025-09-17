import React from "react";

interface CustomButtonProps {
  text: string;
  style?: string;
  typeButton?: "button" | "submit";
  onClickButton?: () => void;
  icon?: React.ElementType; 
  iconColor?: string;
  disabled?: boolean; 
}

export default function CustomButton({
  text,
  style,
  onClickButton,
  typeButton = "button",
  icon: IconComponent,
  iconColor = "white",
  disabled = false,
}: CustomButtonProps) {
  return (
    <button
      className={`${style} px-5 py-2 rounded text-center my-2 font-medium flex items-center justify-center gap-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      type={typeButton}
      onClick={onClickButton}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className="w-5 h-5" color={iconColor} />}
      {text}
    </button>
  );
}
