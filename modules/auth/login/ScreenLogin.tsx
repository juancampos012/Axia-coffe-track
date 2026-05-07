import React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft } from 'lucide-react';
import LoginBox from "./LoginBox";

const ScreenLogin: React.FC = () => {
  const t = useTranslations('login');
  const locale = useLocale();
  
  return (
    <div 
      className="min-h-screen w-full flex flex-row items-center justify-between p-4 relative overflow-hidden" 
      style={{
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
      }}
    >
      {/* Efecto de luz ambiental (Opcional, da mucha estética) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <Link 
        href={`/${locale}/`} 
        className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="mr-1 h-5 w-5" />
        <span>{t("backToHome")}</span>
      </Link>
      
      {/* Lado Izquierdo: Logo */}
      <div className="flex-1 flex flex-col justify-center items-center z-10">
        <div className="relative group">
          {/* Resplandor suave detrás del logo */}
          <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-150" />
          <Image
            src="/Images/logo_blanco.png"
            alt="Logo"
            width={180} // Un poco más grande para que destaque
            height={100}
            className="relative drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </div>
      </div>

      {/* Línea Divisoria Estética con Brillo */}
      <div className="relative h-3/5 w-[1px] hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-500/50 to-transparent" />
        {/* Punto de brillo central en la línea */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-20 bg-white/20 blur-[2px]" />
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="flex-1 flex justify-center items-center z-10">
        <div className="w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2">
             <LoginBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenLogin;