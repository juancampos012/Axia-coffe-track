'use client';
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { FaFileInvoice, FaHandHoldingUsd, FaChartBar, FaCashRegister } from 'react-icons/fa';
import CardHeroBlur from './cardHeroBlur';

export default function HeroBlur() {
  const t = useTranslations("home");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    { icon: <FaFileInvoice className="text-2xl" style={{ color: '#4a7fff' }} />, title: "Facturación POS", description: "Emite facturas y comprobantes de compra de café de forma organizada." },
    { icon: <FaHandHoldingUsd className="text-2xl" style={{ color: '#4a7fff' }} />, title: "Control de Préstamos", description: "Gestiona adelantos a proveedores y descuéntalos automáticamente en la liquidación." },
    { icon: <FaCashRegister className="text-2xl" style={{ color: '#4a7fff' }} />, title: "Cierre de Caja", description: "Monitorea el flujo de efectivo diario y evita descuadres en tu compraventa." },
    { icon: <FaChartBar className="text-2xl" style={{ color: '#4a7fff' }} />, title: "Contabilidad Real", description: "Reportes de ingresos, egresos y utilidades netas por periodo." },
  ];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: isMobile ? 0.3 : 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, [isMobile]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 flex flex-col items-center justify-center" style={{ background: '#04060f' }}>
      {/* Glow central */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(30,60,139,0.15) 0%, transparent 65%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 max-w-6xl text-center px-6">
        <h2 className={`text-4xl md:text-5xl font-bold text-white mb-4 transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
          Orden administrativo para tu{' '}
          <span style={{ color: '#4a7fff' }}>negocio cafetero</span>
        </h2>

        <p className={`text-lg max-w-2xl mx-auto mb-16 transition-all duration-1000 ease-out delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          Lleva el control de cada peso. Desde la factura de compra hasta el seguimiento de deudas y préstamos a tus proveedores de café.
        </p>

        <div className={`transition-all duration-1000 ease-out delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <CardHeroBlur key={i} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}