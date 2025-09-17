"use client"

import React from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from "next-intl";

import CustomButton from "@/components/atoms/CustomButton";
import LanguageSelector from "@/components/atoms/LanguageSelector";
import { standardLinkHome } from "@/utils/tokens";

const Navbar = () => {
  const router = useRouter();
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <nav className="bg-black dark:bg-gray-900 fixed w-full z-20 top-0">
      <div className="max-w-screen-xl flex items-center justify-between p-4 mx-auto">
        <Link href={`/${locale}/`} className="flex space-x-3">
          <Image 
            src="/Images/logo_blanco.png"  
            alt="Axia logo" 
            width={50} 
            height={50} 
          />
        </Link>

        <div className="hidden md:flex flex-grow justify-center">
          <ul className="flex space-x-8 font-medium">
            <li><Link href={`/${locale}/`} className={`${standardLinkHome}`}>{t("inicio")}</Link></li>
            <li><Link href={`/${locale}/aboutus`} className={`${standardLinkHome}`}>{t("aboutus")}</Link></li>
            <li><Link href={`/${locale}/contactus`} className={`${standardLinkHome}`}>{t("contactus")}</Link></li>
          </ul>
        </div>

        <div className="flex md:order-2 items-center gap-4">
          <LanguageSelector variant="navbar" />
          
          <CustomButton
            text={t("placeholderPlatform")}
            style="bg-homePrimary text-white font-semibold" 
            onClickButton={() => router.push(`/${locale}/login`)}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
