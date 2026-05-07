'use client';

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function ContentHero() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-black py-32 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Luz de fondo sutil y elegante */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#D4A373]/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* TÍTULO IMPACTANTE */}
        <div className={`transition-all duration-[1200ms] delay-100 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
            MENOS CUADERNOS. <br />
            <span className="text-[#D4A373]">MÁS CONTROL.</span>
          </h2>
        </div>

        {/* PÁRRAFO DE VALOR */}
        <div className={`transition-all duration-[1200ms] delay-300 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <p className="text-gray-500 text-xl md:text-2xl font-medium mb-16 leading-relaxed max-w-2xl mx-auto">
            Axia Coffee Track es la herramienta digital que organiza tus deudas, facturas y cierres de caja en un solo lugar.
          </p>
        </div>

        {/* LISTA MINIMALISTA (Sin cajas, solo texto y guiones elegantes) */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-20 transition-all duration-[1200ms] delay-500 transform ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}>
          <div>
            <span className="block text-[#D4A373] font-bold text-lg mb-2">— PRÉSTAMOS</span>
            <p className="text-gray-400 text-sm">Saldos automáticos por cada caficultor.</p>
          </div>
          <div>
            <span className="block text-[#D4A373] font-bold text-lg mb-2">— FACTURACIÓN</span>
            <p className="text-gray-400 text-sm">Comprobantes POS en segundos.</p>
          </div>
          <div>
            <span className="block text-[#D4A373] font-bold text-lg mb-2">— CAJA</span>
            <p className="text-gray-400 text-sm">Cierres diarios sin descuadres.</p>
          </div>
        </div>

        {/* BOTÓN REDISEÑADO (EL "GLOW" BUTTON) */}
        <div className={`transition-all duration-[1000ms] delay-600 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}>
          <Link href="/contactus" className="group relative inline-flex items-center justify-center">
            {/* Efecto de luz detrás del botón */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Cuerpo del botón */}
            <button className="relative px-10 py-4 bg-black border border-[#D4A373]/50 text-white rounded-full leading-none flex items-center transition-all duration-300 group-hover:border-[#D4A373]">
              <span className="text-sm font-bold tracking-widest uppercase mr-3">Empezar ahora</span>
              <svg 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
          
          <p className="mt-8 text-gray-600 text-[10px] tracking-[0.2em] font-bold uppercase">
            Control Financiero • Especializado en Café
          </p>
        </div>
      </div>
    </section>
  );
}