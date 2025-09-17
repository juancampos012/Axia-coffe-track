'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from "next/image";

import { ToggleSwitch } from '../../components/molecules/ToggleSwitch';
import pricingBg from '@/public/Images/pricing-bg1.png';
import { PricingCard } from './pricing/PricingCard';

export const PricingSection: React.FC = () => {
  const t = useTranslations("home.pricing");

  const [billingPeriod, setBillingPeriod] = useState<'mo' | 'yr'>('mo');
  const [activeToggleIndex, setActiveToggleIndex] = useState(0);

  // Estado y referencia para Intersection Observer
  const [rotate, setRotate] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Creamos el observador
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si la sección está en pantalla, rotamos la imagen
        if (entry.isIntersecting) {
          setRotate(true);
        } else {
          setRotate(false);
        }
      },
      { threshold: 0.2 } // Ajusta el porcentaje de visibilidad que activa la rotación
    );

    // Observamos el contenedor de la sección
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleToggleChange = (index: number) => {
    setActiveToggleIndex(index);
    setBillingPeriod(index === 0 ? 'mo' : 'yr');
  };

  // Calcula el precio según el periodo (mensual o anual)
  const getPrice = (monthlyPrice: number) => {
    return billingPeriod === 'mo'
      ? monthlyPrice
      : Math.round(monthlyPrice * 10); // Ejemplo: anual = 10 meses
  };

  const plans = [
    {
      title: t('plans.basic.title'),
      price: getPrice(19),
      features: t.raw('plans.basic.features') as string[],
    },
    {
      title: t('plans.pro.title'),
      price: getPrice(49),
      features: t.raw('plans.pro.features') as string[],
      highlighted: true,
    },
    {
      title: t('plans.allin.title'),
      price: getPrice(99),
      features: t.raw('plans.allin.features') as string[],
    },
  ];

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen text-white flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Fondo con imagen (rotación en base al estado 'rotate') */}
      <div
        className={`absolute inset-0 z-0 ${
          rotate ? 'animate-[spin_10s_linear_infinite]' : ''
        }`}
      >
        <Image
          src={pricingBg}
          alt="Background Image"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="opacity-60"
        />
      </div>

      {/* Contenido de la sección */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("header1")} <br /> {t("header2")}
          </h2>
          
          <p className="text-gray-200 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          <div className="mt-8">
            <ToggleSwitch
              options={[t('billing.monthly'), t('billing.yearly')]}
              activeIndex={activeToggleIndex}
              onChange={handleToggleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              price={plan.price}
              period={billingPeriod}
              features={plan.features}
              highlighted={plan.highlighted}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
