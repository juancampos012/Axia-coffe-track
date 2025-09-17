"use client"

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { ClientDAO } from "@/types/Api";
import CustomButton from "@/components/atoms/CustomButton";

interface CustomerDetailClientProps {
    customer: ClientDAO;
}

export default function CustomerDetailClient({ customer }: CustomerDetailClientProps) {
    const router = useRouter();
    const t = useTranslations("customerDetail");

    return (
        <div className="relative w-full min-h-screen text-white flex justify-center">
            <Image 
                src="/Images/fondoHerooo.png" 
                alt="Background Image" 
                fill 
                className="absolute top-0 left-0 w-full h-full object-cover"
                priority
            />
            <div className="relative w-full max-w-4xl bg-blac bg-opacity-50 rounded-lg shadow-lg mt-20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
                    <CustomButton 
                        text={t("backButton")}  
                        style="bg-tertiary text-white hover:bg-blue-800"
                        onClickButton={() => router.back()}
                    />
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-black bg-opacity-30 p-6 rounded-lg">
                        <h3 className="font-bold text-2xl mb-3 text-tertiary text-center">{`${customer.firstName} ${customer.lastName}`}</h3>
                        <p className="text-sm text-gray-300 text-center mb-16">{t("id")}: {customer.id}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="p-4 border border-gray-600 rounded-lg">
                                <p className="text-sm font-semibold text-gray-400 mb-2">{t("email")}</p>
                                <p className="text-white">{customer.email}</p>
                            </div>

                            <div className="p-4 border border-gray-600 rounded-lg">
                                <p className="text-sm font-semibold text-gray-400 mb-2">{t("identification")}</p>
                                <p className="text-white">{customer.identification}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
