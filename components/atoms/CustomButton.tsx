import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface CustomButtonProps {
  text: string;
  style?: string;
  variant?: ButtonVariant;
  typeButton?: "button" | "submit";
  onClickButton?: () => void;
  icon?: React.ElementType;
  iconColor?: string;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-white font-semibold hover:opacity-90 active:scale-95",
  secondary:
    "text-white/70 hover:text-white font-medium hover:bg-white/5 active:scale-95",
  ghost:
    "font-medium hover:bg-white/5 active:scale-95",
  danger:
    "text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium active:scale-95",
};

const variantInlineStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)",
    boxShadow: "0 4px 14px rgba(30,60,139,0.4)",
  },
  secondary: {
    border: "1px solid rgba(30,60,139,0.45)",
  },
  ghost: {
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.45)",
  },
  danger: {},
};

export default function CustomButton({
  text,
  style,
  variant = "secondary",
  onClickButton,
  typeButton = "button",
  icon: IconComponent,
  disabled = false,
}: CustomButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${style ?? ""}`}
      style={variantInlineStyles[variant]}
      type={typeButton}
      onClick={onClickButton}
      disabled={disabled}
    >
      {IconComponent && <IconComponent className="w-4 h-4 flex-shrink-0" />}
      {text}
    </button>
  );
}
