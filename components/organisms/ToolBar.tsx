import React from "react";
import { useTranslations } from "next-intl";

import { CirclePlus, Printer } from "lucide-react";
import CustomButton from "../atoms/CustomButton";

interface ToolbarProps {
    title: string;
    onAddNew?: () => void;  
    showAddButton?: boolean; 
    invoice?: boolean;
}

export default function Toolbar({ title, onAddNew, showAddButton = true, invoice = false }: ToolbarProps) {
    const t = useTranslations("toolbar");

    return (
        <div className="p-4 shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-homePrimary-200">{title}</h2>

                {showAddButton && (
                    
                    <div className="flex gap-3">
                        {!invoice && (
                            <CustomButton
                                text={t("add")}
                                style="px-4 py-2 rounded-lg text-white bg-homePrimary-400 hover:bg-blue-800" 
                                icon={CirclePlus} 
                                onClickButton={onAddNew} 
                            />
                        )}

                        <CustomButton 
                            text={t("imprimir")}
                            style="px-4 py-2 rounded-lg text-white bg-homePrimary hover:bg-blue-500" 
                            icon={Printer} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}