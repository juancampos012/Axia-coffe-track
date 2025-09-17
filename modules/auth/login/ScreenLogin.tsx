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
      className="min-h-screen w-full flex flex-row items-center justify-between p-4 relative" 
      style={{ backgroundImage: "url('/Images/fondoHeroo.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      <Link 
        href={`/${locale}/`} 
        className="absolute top-6 left-6 flex items-center text-white hover:text-homePrimary transition-colors z-10"
      >
        <ArrowLeft className="mr-1 h-5 w-5" />
        <span>{t("backToHome")}</span>
      </Link>
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <Image
          src="/Images/logo_blanco.png"
          alt="Logo"
          width={150}
          height={80}
        />
      </div>
      <div className="flex-1 flex justify-center items-center">
        <LoginBox />
      </div>
    </div>
  );
};

export default ScreenLogin;