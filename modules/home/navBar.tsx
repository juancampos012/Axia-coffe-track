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
    <nav
      className="fixed w-full z-50 top-0 transition-all duration-300"
      style={{
        background: 'rgba(4,6,18,0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(30,60,139,0.25)',
      }}
    >
      <div className="max-w-screen-xl flex items-center justify-between px-6 py-4 mx-auto">
        <Link href={`/${locale}/`} className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src="/Images/logo_blanco.png"
              alt="Axia Coffee Track Logo"
              width={40}
              height={40}
              className="group-hover:scale-105 transition-transform duration-300"
            />
            <div
              className="absolute inset-0 rounded-full -z-10"
              style={{ background: 'rgba(30,60,139,0.25)', filter: 'blur(12px)' }}
            />
          </div>
          <span
            className="hidden sm:block font-bold text-lg text-white tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            AXIA <span style={{ color: '#4a7fff' }}>COFFEE</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-10">
          {[
            { href: `/${locale}/`, label: t("inicio") },
            { href: `/${locale}/aboutus`, label: 'Nosotros' },
            { href: `/${locale}/contactus`, label: 'Soporte Técnico' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-medium uppercase tracking-widest transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(74,127,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="relative inline-flex items-center justify-center px-6 py-2.5 font-bold text-white text-sm rounded-xl transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)',
            boxShadow: '0 0 24px rgba(30,60,139,0.35)',
            fontFamily: 'Syne, sans-serif',
            letterSpacing: '0.04em',
          }}
        >
          {t("placeholderPlatform")}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;