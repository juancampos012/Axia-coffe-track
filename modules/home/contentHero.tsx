'use client';

import React, { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import CustomButton from "@/components/atoms/CustomButton";
import Link from "next/link";

export default function ContentHero() {
  const t = useTranslations("home.contentHero");

  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    setIsMobile(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);
  
  useEffect(() => {
    const threshold = isMobile ? 0.25 : 0.3; 
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold
      }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-black py-20 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-homePrimary/30 via-black/90 to-black opacity-95 blur-[100px]" />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
        
        <div
          className={`transition-all duration-1000 ease-in-out transform ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          <h2 className="text-homePrimary-100 text-4xl font-bold mb-4 leading-tight">
            {t("title")}
          </h2>

          <p className="text-gray-300 mb-6 text-lg leading-relaxed">
            {t("description")}
          </p>

          <Link href={'/es/contactus'}>
            <CustomButton 
              text={t("buttonText")} 
              style="bg-homePrimary hover:bg-primary text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105" 
            />
          </Link>
        </div>

        <div
          className={`grid grid-cols-2 gap-4 transition-all duration-1000 ease-in-out transform ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="max-h-[370px]"> 
            <Image
              src="/Images/oficinaContabilidad.avif"
              alt="Imagen X"
              width={500}
              height={500}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="grid grid-rows-2 gap-4 h-full">
            <div className="h-full">
              <Image
                src="/Images/invoice.jpg"
                alt="Imagen Y"
                width={500}
                height={500}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 h-full">
              <div>
                <Image
                  src="/Images/trabajoCasa.avif"
                  alt="Imagen Z"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div>
                <Image
                  src="/Images/computadorCon.jpg"
                  alt="Imagen O"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}