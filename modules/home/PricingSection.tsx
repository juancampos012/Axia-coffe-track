'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';

const PLAN_FEATURES = [
  "Control de compras y ventas", "Gestión de préstamos a proveedores",
  "Arqueo y cierre de caja diario", "Historial de pagos por caficultor",
  "Reporte de ingresos y egresos", "Facturación POS rápida",
  "Acceso desde celular o PC", "Soporte técnico por WhatsApp",
];

export const PricingSection: React.FC = () => {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  return (
    <section className="relative py-24 flex flex-col items-center justify-center overflow-hidden" style={{ background: '#04060f' }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(30,60,139,0.2) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-0 left-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(74,127,255,0.4))', transform: 'translateX(-50%)' }} />

      <div ref={sectionRef} className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(30,60,139,0.15)', border: '1px solid rgba(30,60,139,0.35)', color: '#4a7fff' }}
          >
            Inversión para tu negocio
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#ffff' }}>Un solo plan,</span>{' '}<br /><span style={{ color: '#4a7fff' }}>control total.</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg mb-16" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Todo lo que necesitas para organizar las cuentas de tu compraventa sin complicaciones técnicas.
          </p>
        </div>

        <div className={`mt-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative max-w-md mx-auto">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(74,127,255,0.7), transparent)' }} />
            <div className="rounded-3xl p-8" style={{ background: 'rgba(8,12,28,0.9)', border: '1px solid rgba(30,60,139,0.3)', backdropFilter: 'blur(20px)' }}>
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(30,60,139,0.15)', border: '1px solid rgba(30,60,139,0.3)', color: '#4a7fff' }}>
                Uso Ilimitado
              </span>
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>$</span>
                <span className="text-7xl font-black leading-none" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em', color: '#ffff' }}>80.000</span>
                <span className="text-xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>COP</span>
              </div>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Pago mensual · Sin contratos de permanencia</p>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }} />
              <ul className="grid grid-cols-1 gap-3 text-left mb-8">
                {PLAN_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(30,60,139,0.2)', color: '#4a7fff' }}>✔</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/contactus`}
                className="block w-full py-4 px-8 rounded-2xl text-center font-black text-sm uppercase tracking-wider text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)',
                  boxShadow: '0 8px 28px rgba(30,60,139,0.4)',
                  fontFamily: 'Syne, sans-serif',
                  letterSpacing: '0.06em',
                }}
              >
                Registrar mi compraventa
              </Link>
              <p className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>* Incluye acompañamiento en la configuración inicial</p>
            </div>
          </div>
        </div>

        <div className={`mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {['Soporte Directo', 'Copias de seguridad diarias', 'Sin instalación (Todo en la nube)'].map(t => (
            <span key={t} className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ color: '#4a7fff' }}>✔</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};