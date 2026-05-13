"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = {
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  error?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", icon: IconComponent, error, disabled, className, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const borderColor = error
      ? "rgba(239,68,68,0.5)"
      : focused
      ? "rgba(74,127,255,0.7)"
      : "rgba(30,60,139,0.35)";

    return (
      <div className="w-full">
        <div
          className={`relative flex items-center w-full transition-all duration-200 rounded-xl px-4 py-2.5 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className ?? ""}`}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${borderColor}`,
            boxShadow: focused && !error ? "0 0 0 3px rgba(74,127,255,0.08)" : "none",
          }}
        >
          {IconComponent && (
            <IconComponent
              className="mr-3 size-5 transition-colors"
              style={{ color: focused ? "#4a7fff" : "rgba(255,255,255,0.3)" }}
            />
          )}

          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            className={`flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25 w-full ${disabled ? "cursor-not-allowed" : ""}`}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 p-1 rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
              tabIndex={-1}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
