'use client';
import { useTranslations } from "next-intl";

export default function MisionVision() {
  const t = useTranslations("misionVision");

  return (
    <section className="relative overflow-hidden py-32 flex flex-col items-center justify-center" style={{ background: '#04060f' }}>
      {/* Aurora fondo */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(30,60,139,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      {/* Línea superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16" style={{ background: 'linear-gradient(to bottom, transparent, rgba(74,127,255,0.5))' }} />

      {/* Encabezado */}
      <div className="z-10 max-w-4xl px-6 text-center mb-20">
        <span
          className="inline-block text-xs font-bold uppercase tracking-[0.18em] mb-5 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(30,60,139,0.15)', border: '1px solid rgba(30,60,139,0.35)', color: '#4a7fff' }}
        >
          Quiénes somos
        </span>
        <h1
          className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}
        >
          {t("title")}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t("description")}
        </p>
      </div>

      {/* Cards Misión / Visión */}
      <div className="flex flex-col md:flex-row gap-6 z-10 max-w-5xl px-6 w-full justify-center">
        {[
          { num: '01', titleKey: 'mission.title', textKey: 'mission.text' },
          { num: '02', titleKey: 'vision.title', textKey: 'vision.text' },
        ].map(({ num, titleKey, textKey }) => (
          <div key={num} className="relative group w-full md:w-[45%]">
            {/* Borde gradiente */}
            <div
              className="absolute -inset-px rounded-3xl opacity-40 group-hover:opacity-100 transition duration-500 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(30,60,139,0.6), transparent)' }}
            />
            <div
              className="relative p-10 rounded-3xl h-full"
              style={{ background: 'rgba(8,12,28,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(30,60,139,0.2)' }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-6 font-bold text-sm"
                style={{ background: 'rgba(30,60,139,0.2)', border: '1px solid rgba(30,60,139,0.4)', color: '#4a7fff' }}
              >
                {num}
              </div>
              <h2
                className="text-3xl font-bold text-white mb-5 tracking-tight"
                style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
              >
                {t(titleKey)}
              </h2>
              <p className="text-lg leading-relaxed text-left" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t(textKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}