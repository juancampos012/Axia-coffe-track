'use client';
import React, { useEffect, useRef, useState } from 'react';

const WHATSAPP_NUMBER = '573104654726';

const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.704a.75.75 0 0 0 .916.932l5.97-1.463A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.692-.497-5.24-1.367l-.376-.213-3.9.956.99-3.792-.232-.39A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const openWhatsApp = (plan: string, price: string) => {
  const msg = encodeURIComponent(
    `¡Hola! Me interesa suscribirme a *Axia Coffee Track* ☕\n\n` +
    `📦 Plan: *${plan}*\n` +
    `💰 Precio: $${price} COP/mes\n\n` +
    `¿Me pueden dar más información para comenzar?`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
};

const PLANS = [
  {
    id: 'esencial',
    name: 'Esencial',
    price: '89.900',
    tag: 'Para empezar',
    tagColor: 'rgba(255,255,255,0.12)',
    tagBorder: 'rgba(255,255,255,0.15)',
    tagText: 'rgba(255,255,255,0.5)',
    highlight: false,
    features: [
      'Registro de compras a proveedores',
      'Ventas y facturación POS',
      'Inventario multiproducto en tiempo real',
      'Caja diaria — ingresos y egresos',
      'Comprobantes y facturas en PDF',
      'Acceso desde celular o PC (nube)',
      'Hasta 2 usuarios por empresa',
      'Soporte técnico por WhatsApp',
    ],
  },
  {
    id: 'completo',
    name: 'Completo',
    price: '149.900',
    tag: 'Más popular',
    tagColor: 'rgba(30,60,139,0.25)',
    tagBorder: 'rgba(74,127,255,0.4)',
    tagText: '#4a7fff',
    highlight: true,
    features: [
      'Todo lo del plan Esencial',
      'Factor de rendimiento automático (mojado → excelso)',
      'Cuentas por cobrar — clientes y aliados',
      'Cuentas por pagar — proveedores',
      'Entregas a aliados con seguimiento de deuda',
      'Préstamos y depósitos a proveedores',
      'Cierre de períodos contables',
      'Empaques y logística',
      'Usuarios ilimitados por empresa',
      'Acompañamiento en la configuración inicial',
    ],
  },
];

export const PricingSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  return (
    <section
      className="relative py-28 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#04060f' }}
    >
      {/* Decoración */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(30,60,139,0.18) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute top-0 left-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(74,127,255,0.4))', transform: 'translateX(-50%)' }} />

      <div ref={sectionRef} className="relative z-10 w-full max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(30,60,139,0.15)', border: '1px solid rgba(30,60,139,0.35)', color: '#4a7fff' }}
          >
            Planes y precios
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
          >
            Elige el plan que{' '}
            <span style={{ color: '#4a7fff' }}>se adapta a ti.</span>
          </h2>
          <p className="max-w-lg mx-auto text-lg" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Sin contratos de permanencia. Cambia o cancela cuando quieras.
          </p>
        </div>

        {/* Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-3xl p-8 flex flex-col"
              style={{
                background: plan.highlight ? 'rgba(10,18,40,0.95)' : 'rgba(8,12,24,0.7)',
                border: plan.highlight
                  ? '1px solid rgba(30,60,139,0.5)'
                  : '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                boxShadow: plan.highlight ? '0 0 60px rgba(30,60,139,0.2)' : 'none',
              }}
            >
              {/* Línea superior destacada */}
              {plan.highlight && (
                <div
                  className="absolute top-0 left-8 right-8 h-px"
                  style={{ background: 'linear-gradient(to right, transparent, rgba(74,127,255,0.7), transparent)' }}
                />
              )}

              {/* Tag */}
              <span
                className="inline-block self-start text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6"
                style={{ background: plan.tagColor, border: `1px solid ${plan.tagBorder}`, color: plan.tagText }}
              >
                {plan.tag}
              </span>

              {/* Nombre */}
              <h3
                className="text-xl font-black text-white mb-4 uppercase tracking-wide"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {plan.name}
              </h3>

              {/* Precio */}
              <div className="flex items-end gap-1 mb-1">
                <span className="text-lg font-bold mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>$</span>
                <span
                  className="text-6xl font-black leading-none"
                  style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em', color: '#fff' }}
                >
                  {plan.price}
                </span>
                <span className="text-lg font-bold mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>COP</span>
              </div>
              <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.25)' }}>
                por mes · pago mensual
              </p>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }} />

              {/* Features */}
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5"
                      style={{
                        background: plan.highlight ? 'rgba(30,60,139,0.3)' : 'rgba(255,255,255,0.06)',
                        color: plan.highlight ? '#4a7fff' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      ✔
                    </span>
                    <span className={f === 'Todo lo del plan Esencial' ? 'font-bold text-white/40 italic' : ''}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <button
                onClick={() => openWhatsApp(plan.name, plan.price)}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                style={plan.highlight ? {
                  background: 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)',
                  boxShadow: '0 8px 28px rgba(30,60,139,0.4)',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <WaIcon /> Suscribirme por WhatsApp
              </button>
            </div>
          ))}
        </div>

        {/* Footer badges */}
        <div className={`mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {['Soporte directo por WhatsApp', 'Sin instalación — todo en la nube', 'Cancela cuando quieras'].map(t => (
            <span key={t} className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ color: '#4a7fff' }}>✔</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
