'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import frisbyImg  from "@/public/Images/Axia-frisby.png";

export default function Hero() {
    const t = useTranslations("home");

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <section className="relative w-full h-screen text-white flex flex-col justify-center items-center">
            <Image 
                src="/Images/fondoHerooo.png" 
                alt="Background Image" 
                fill 
                priority 
                className="object-cover"
            />
        
            <div className="container mx-auto px-8 md:px-16 z-10 flex flex-col md:flex-row items-center justify-center gap-12">
                <div className={`md:text-left text-center max-w-xl transition-opacity duration-1000 ease-in-out ${
                    isMounted ? 'opacity-100' : 'opacity-0'
                }`}>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {t("headline")}
                    </h1>
                    
                    <p className="text-gray-300 mt-4 transition-opacity duration-1000 ease-in-out delay-300">
                        {t("subheadline")}
                    </p>
                    
                    <div className="mt-6 space-x-4 transition-opacity duration-1000 ease-in-out delay-500">
                        <Link href={"/es/contactus"}> 
                            <button className="bg-homePrimary px-6 py-2 rounded-lg text-white font-semibold">
                                {t("startButton")}
                            </button>
                        </Link>
                    </div>
                </div>

                <div className={`flex justify-center transition-opacity duration-1000 ease-in-out delay-200 ${
                    isMounted ? 'opacity-100' : 'opacity-0'
                }`}>
                    <Image 
                        src={frisbyImg}
                        alt="Axia Invoice"
                        width={500}
                        height={500}
                        className="object-contain max-h-[500px]"
                    />
                </div>
            </div>
        </section>
    );
};
