"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = {
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  error?: boolean; // Añadido para manejar estados de error visualmente
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", icon: IconComponent, error, disabled, className, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // Lógica para alternar visibilidad de contraseña
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        <div 
          className={`
            group relative flex items-center w-full transition-all duration-200 
            bg-zinc-900/50 border rounded-xl px-4 py-2.5
            ${error ? "border-red-500 ring-1 ring-red-500" : "border-zinc-700 focus-within:border-homePrimary focus-within:ring-1 focus-within:ring-homePrimary"}
            ${disabled ? "opacity-50 cursor-not-allowed bg-zinc-800" : "hover:border-zinc-500"}
            ${className}
          `}
        >
          {/* Icono de entrada si existe */}
          {IconComponent && (
            <IconComponent className={`mr-3 size-5 transition-colors ${error ? "text-red-400" : "text-zinc-500 group-focus-within:text-homePrimary"}`} />
          )}

          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-500 w-full
              ${disabled ? "cursor-not-allowed" : ""}
              ${type === "date" ? "invert-calendar-icon" : ""} 
            `}
            {...rest}
          />

          {/* Botón para Password */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100"
              tabIndex={-1} // Evita que el tabulador se detenga aquí innecesariamente
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