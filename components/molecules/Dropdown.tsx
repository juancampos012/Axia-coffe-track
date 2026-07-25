'use client'

import React from "react";
import { ChevronDown } from "lucide-react";

interface Option {
    text: string;
    icon?: React.ReactNode;
    action?: () => void;
}

interface DropdownProps {
    options: Option[];
    selected?: string;
    style?: string;
    onSelect?: (value: string) => void;
    useIconButton?: boolean;
    icon?: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    isLastItem?: boolean; 
    className?: string; 
}

export default function Dropdown({ 
    options, 
    selected, 
    style, 
    onSelect, 
    useIconButton = false, 
    icon, 
    isOpen, 
    onToggle,
    isLastItem = false,
    className = "" 
}: DropdownProps) {
    
    const handleSelect = (option: Option) => {
        if (option.action) {
            option.action(); 
        } else if (onSelect) {
            onSelect(option.text);
        }
        onToggle();
    };

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={`transition-all duration-200 p-2 rounded-xl border ${
                    useIconButton
                    ? `border-transparent ${isOpen ? 'bg-[rgba(74,127,255,0.15)] text-[#4a7fff]' : 'text-white/40 hover:bg-white/5 hover:text-white'}`
                    : "flex justify-between items-center w-full text-white shadow-sm px-4"
                }`}
                style={!useIconButton ? { background: "rgba(255,255,255,0.03)", borderColor: "rgba(30,60,139,0.4)" } : undefined}
            >
                {useIconButton ? icon : (
                    <>
                        <span className="mr-2 truncate">{selected}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Overlay para cerrar al hacer clic fuera */}
                    <div className="fixed inset-0 z-[90] cursor-default" onClick={onToggle} />

                    <div
                        className={`
                            absolute right-0 z-[100] w-52 rounded-xl py-1.5 overflow-hidden animate-in fade-in zoom-in duration-150
                            ${isLastItem ? 'bottom-full mb-2' : 'mt-2'}
                            ${style}
                        `}
                        style={{
                            background: "rgba(10,14,28,0.98)",
                            border: "1px solid rgba(30,60,139,0.4)",
                            backdropFilter: "blur(16px)",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
                        }}
                    >
                        {options.map((option, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                                style={{ borderBottom: index < options.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,127,255,0.08)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                {option.icon && <span className="mr-3 shrink-0">{option.icon}</span>}
                                <span className="truncate">{option.text}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}