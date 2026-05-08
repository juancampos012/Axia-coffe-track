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
    <section ref={sectionRef} className="relative py-32 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#04060f' }}>
      {/* Línea superior decorativa */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(74,127,255,0.5))' }} />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className={`transition-all duration-[1200ms] delay-100 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <h2
            className="text-5xl md:text-7xl font-black text-white mb-8 leading-none"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em' }}
          >
            MENOS CUADERNOS.<br />
            <span style={{ color: '#4a7fff' }}>MÁS CONTROL.</span>
          </h2>
        </div>

        <div className={`transition-all duration-[1200ms] delay-300 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xl md:text-2xl font-medium mb-16 leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Axia Coffee Track es la herramienta digital que organiza tus deudas, facturas y cierres de caja en un solo lugar.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-20 transition-all duration-[1200ms] delay-500 transform ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          {[['— PRÉSTAMOS', 'Saldos automáticos por cada caficultor.'], ['— FACTURACIÓN', 'Comprobantes POS en segundos.'], ['— CAJA', 'Cierres diarios sin descuadres.']].map(([title, desc]) => (
            <div key={title}>
              <span className="block font-bold text-base mb-2" style={{ color: '#4a7fff', letterSpacing: '0.1em' }}>{title}</span>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className={`transition-all duration-[1000ms] delay-600 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
          <Link href="/contactus" className="group relative inline-flex items-center justify-center">
            <div
              className="absolute -inset-1 rounded-full opacity-30 group-hover:opacity-75 transition duration-500"
              style={{ background: 'linear-gradient(135deg, rgba(30,60,139,0.8), rgba(74,127,255,0.5))', filter: 'blur(10px)' }}
            />
            <button
              className="relative flex items-center gap-3 px-10 py-4 rounded-full text-white font-bold text-sm tracking-widest uppercase transition-all duration-300"
              style={{ background: '#04060f', border: '1px solid rgba(30,60,139,0.6)', fontFamily: 'Syne, sans-serif' }}
            >
              Empezar ahora
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
          <p className="mt-8 text-[10px] tracking-[0.2em] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Control Financiero • Especializado en Café
          </p>
        </div>
      </div>
    </section>
  );
}