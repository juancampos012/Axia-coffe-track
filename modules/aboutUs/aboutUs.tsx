'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const PEOPLE = [
  { name: 'Juan Campos',      img: '/Images/22495.png' },
  { name: 'Santiago Jimenez', img: '/Images/22495.png' },
];

export default function AboutUs() {
  const t = useTranslations("aboutUs");

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: '#04060f' }}>
      {/* Glow central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(30,60,139,0.15) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">

        {/* Encabezado */}
        <div className="mb-24">
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.18em] mb-5 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(30,60,139,0.15)', border: '1px solid rgba(30,60,139,0.35)', color: '#4a7fff' }}
          >
            El Factor Humano
          </span>
          <h1
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em' }}
          >
            {t("title")}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {t("description")}
          </p>
        </div>

        {/* Personas */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-20 md:gap-32">
          {PEOPLE.map(({ name, img }) => (
            <div key={name} className="group flex flex-col items-center">
              <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8">
                {/* Aura hover */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: 'rgba(30,60,139,0.5)', filter: 'blur(28px)' }}
                />
                {/* Ring decorativo */}
                <div
                  className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(30,60,139,0.6), rgba(74,127,255,0.3))', padding: 1, borderRadius: '50%' }}
                />
                <Image
                  src={img}
                  alt={name}
                  fill
                  className="rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  style={{ position: 'absolute' }}
                />
              </div>

              <h3
                className="text-3xl text-white font-bold tracking-tight mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {name}
              </h3>
              <p
                className="text-sm font-bold uppercase tracking-widest mb-3"
                style={{ color: '#4a7fff', letterSpacing: '0.15em' }}
              >
                {"Ingeniero de Sistemas"}
              </p>
              <div
                className="h-px w-12 mb-4 group-hover:w-20 transition-all duration-500"
                style={{ background: 'rgba(74,127,255,0.4)' }}
              />
              <p className="text-sm max-w-[200px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t("person.title")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}