'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

// Características adaptadas al negocio del café
const PLAN_FEATURES = [
  "Control de compras y ventas",
  "Gestión de préstamos a proveedores",
  "Arqueo y cierre de caja diario",
  "Historial de pagos por caficultor",
  "Reporte de ingresos y egresos",
  "Facturación POS rápida",
  "Acceso desde celular o PC",
  "Soporte técnico por WhatsApp",
];

export const PricingSection: React.FC = () => {
  const t = useTranslations("home.pricing");
  const locale = useLocale();

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-24 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Fondo decorativo con el color café de la marca */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D4A373]/20 via-black/95 to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[#D4A373]/50" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">

        {/* Encabezado */}
        <div
          className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-[#D4A373] text-sm font-bold uppercase tracking-widest mb-3">
            Inversión para tu negocio
          </p>
          <h2 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Un solo plan, <br />
            <span className="text-[#D4A373]">control total.</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Todo lo que necesitas para organizar las cuentas de tu compraventa sin complicaciones técnicas.
          </p>
        </div>

        {/* Tarjeta de precio única */}
        <div
          className={`mt-16 transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative max-w-md mx-auto">

            {/* Brillo superior decorativo */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#D4A373] to-transparent" />

            {/* Tarjeta */}
            <div className="rounded-3xl border border-[#D4A373]/30 bg-[#0A0A0A] backdrop-blur-sm p-8 shadow-2xl shadow-[#D4A373]/5">

              {/* Badge */}
              <span className="inline-block bg-[#D4A373]/10 text-[#D4A373] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6 border border-[#D4A373]/20">
                Uso Ilimitado
              </span>

              {/* Precio */}
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-gray-500 text-xl font-bold mb-2">$</span>
                <span className="text-white text-7xl font-black tracking-tighter">80.000</span>
                <span className="text-gray-500 text-xl font-bold mb-2">COP</span>
              </div>
              <p className="text-gray-400 text-sm mb-8">Pago mensual · Sin contratos de permanencia</p>

              {/* Divisor */}
              <div className="border-t border-white/5 mb-8" />

              {/* Features enfocadas en el acopiador */}
              <ul className="grid grid-cols-1 gap-4 text-left mb-10">
                {PLAN_FEATURES.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D4A373]/20 flex items-center justify-center text-[#D4A373]">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 10 10" stroke="currentColor">
                        <path d="M1.5 5L4 7.5L8.5 2.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/${locale}/contactus`}
                className="block w-full bg-[#D4A373] hover:bg-[#b88a5d] text-black font-black py-4 px-8 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-[#D4A373]/20"
              >
                REGISTRAR MI COMPRAVENTA
              </Link>

              <p className="text-gray-600 text-xs mt-6">
                * Incluye acompañamiento en la configuración inicial
              </p>
            </div>
          </div>
        </div>

        {/* Garantía / confianza */}
        <div
          className={`mt-12 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-gray-500 transition-all duration-700 ease-out delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-[#D4A373]"> ✔</span> Soporte Directo 
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#D4A373]"> ✔</span> Copias de seguridad diarias 
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#D4A373]"> ✔</span> Sin instalación (Todo en la nube)
          </span>
        </div>
      </div>
    </section>
  );
};