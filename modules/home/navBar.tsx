"use client"

import React from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from "next-intl";

const Navbar = () => {
  const router = useRouter();
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <nav className="bg-black/60 backdrop-blur-xl border-b border-white/10 fixed w-full z-50 top-0 transition-all duration-300">
      <div className="max-w-screen-xl flex items-center justify-between p-4 mx-auto">
        
        {/* Logo Section */}
        <Link href={`/${locale}/`} className="flex items-center space-x-3 group">
          <div className="relative">
            <Image 
              src="/Images/logo_blanco.png"  
              alt="Axia Coffee Track Logo" 
              width={45} 
              height={45}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            {/* Un pequeño resplandor sutil detrás del logo */}
            <div className="absolute inset-0 bg-[#D4A373]/20 blur-xl rounded-full -z-10"></div>
          </div>
          <span className="hidden sm:block text-white font-bold text-xl tracking-tight">
            AXIA <span className="text-[#D4A373]">COFFEE</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex flex-grow justify-center">
          <ul className="flex space-x-10 items-center">
            <li>
              <Link href={`/${locale}/`} className="text-gray-300 hover:text-[#D4A373] transition-colors font-medium text-sm uppercase tracking-wider">
                {t("inicio")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/aboutus`} className="text-gray-300 hover:text-[#D4A373] transition-colors font-medium text-sm uppercase tracking-wider">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contactus`} className="text-gray-300 hover:text-[#D4A373] transition-colors font-medium text-sm uppercase tracking-wider">
                Soporte Técnico
              </Link>
            </li>
          </ul>
        </div>

        {/* Actions Section */}
        <div className="flex md:order-2 items-center gap-6">
          
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-black transition-all duration-300 bg-[#D4A373] rounded-xl hover:bg-[#b88a5d] active:scale-95 shadow-[0_0_20px_rgba(212,163,115,0.3)]"
          >
            <span className="relative">
              {t("placeholderPlatform")}
            </span>
          </button>

          {/* Botón menú móvil (Hambuerguesa) - Opcional */}
          <div className="md:hidden">
            <button className="text-white p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;