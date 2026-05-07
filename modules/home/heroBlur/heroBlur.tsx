'use client';

import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
// Iconos: Facturación, Préstamos/Adelantos, Reportes, y Caja
import { FaFileInvoice, FaHandHoldingUsd, FaChartBar, FaCashRegister } from 'react-icons/fa';

import CardHeroBlur from './cardHeroBlur';

export default function HeroBlur() {
  const t = useTranslations("home");

  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Características enfocadas en CONTABILIDAD Y PRÉSTAMOS
  const features = [
    {
      icon: <FaFileInvoice className="text-3xl text-[#D4A373] mb-4" />,
      title: "Facturación POS", 
      description: "Emite facturas y comprobantes de compra de café de forma organizada.",
    },
    {
      icon: <FaHandHoldingUsd className="text-3xl text-[#D4A373] mb-4" />,
      title: "Control de Préstamos", 
      description: "Gestiona adelantos a proveedores y descuéntalos automáticamente en la liquidación.",
    },
    {
      icon: <FaCashRegister className="text-3xl text-[#D4A373] mb-4" />,
      title: "Cierre de Caja", 
      description: "Monitorea el flujo de efectivo diario y evita descuadres en tu compraventa.",
    },
    {
      icon: <FaChartBar className="text-3xl text-[#D4A373] mb-4" />,
      title: "Contabilidad Real", 
      description: "Reportes de ingresos, egresos y utilidades netas por periodo.",
    },
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    setIsMobile(mediaQuery.matches);
    
    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);
    
  useEffect(() => {
    const threshold = isMobile ? 0.3 : 0.4; 

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [isMobile]); 
    
  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-black py-24 flex flex-col items-center justify-center"
    >
      {/* Brillo de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4A373]/15 via-black/95 to-black opacity-80 blur-[120px]" />

      <div className="relative z-10 max-w-6xl text-center px-6">
        <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-1000 ease-out transform ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
          }`}
        >
          Orden administrativo para tu negocio cafetero
        </h2>
        
        <p className={`text-gray-400 text-lg max-w-3xl mx-auto mb-16 transition-all duration-1000 ease-out transform delay-200 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
          }`}
        >
          Lleva el control de cada peso. Desde la factura de compra hasta el seguimiento de deudas 
          y préstamos a tus proveedores de café.
        </p>
        
        <div className={`transition-all duration-1000 ease-out transform delay-500 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <CardHeroBlur
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}