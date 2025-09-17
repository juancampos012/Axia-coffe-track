"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = {
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  disable?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", icon: IconComponent, disable = false, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full relative">
        <div className="w-full flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-2 bg-black">
          {IconComponent && <IconComponent className="text-gray-500 mr-2" />}

          <input
            ref={ref}
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}

            className={`flex-1 outline-none text-white w-full ${
              disable ? "text-gray-500" : ""
            } ${type === "date" ? "appearance-auto bg-gray-500" : "bg-transparent appearance-none"}`}
            
            disabled={disable}
            {...rest}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-gray-500 ml-2"
            >
              {showPassword ? (
                <Eye color="white" size={20} />
              ) : (
                <EyeOff color="white" size={20} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
