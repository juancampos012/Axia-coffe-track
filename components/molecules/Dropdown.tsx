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
                className={`transition-all duration-200 p-2 rounded-xl border border-transparent ${
                    useIconButton 
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                    : "flex justify-between items-center w-full border-zinc-700 text-white bg-zinc-900 shadow-sm px-4"
                }`}
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
                            absolute right-0 z-[100] w-48 rounded-xl border border-zinc-700 
                            bg-zinc-900 shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in duration-150
                            ${isLastItem ? 'bottom-full mb-2' : 'mt-2'}
                            ${style}
                        `}
                    >
                        {options.map((option, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(option);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-zinc-800/50 last:border-0"
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