'use client';

import { useTranslations } from "next-intl";

export default function MisionVision() {
  const t = useTranslations("misionVision");

  return (
    <section className="relative overflow-hidden bg-black py-32 flex flex-col items-center justify-center">
      {/* Fondo con resplandor café/dorado en lugar de azul */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4A373]/10 via-black/95 to-black opacity-90 blur-[100px]" />

      {/* Encabezado Principal */}
      <div className="z-10 max-w-4xl px-6 text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Contenedor de Cuadros */}
      <div className="flex flex-col md:flex-row gap-8 z-10 max-w-6xl px-6 w-full justify-center">
        
        {/* CUADRO: MISIÓN */}
        <div className="relative group w-full md:w-[45%]">
          {/* Borde con brillo sutil */}
          <div className="absolute -inset-px bg-gradient-to-b from-[#D4A373]/40 to-transparent rounded-3xl opacity-50 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/5 h-full shadow-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4A373]/10 text-[#D4A373] mb-6 border border-[#D4A373]/20">
              <span className="font-bold">01</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">
              {t("mission.title")}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed text-left">
              {t("mission.text")}
            </p>
          </div>
        </div>

        {/* CUADRO: VISIÓN */}
        <div className="relative group w-full md:w-[45%]">
          {/* Borde con brillo sutil */}
          <div className="absolute -inset-px bg-gradient-to-b from-[#D4A373]/40 to-transparent rounded-3xl opacity-50 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/5 h-full shadow-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4A373]/10 text-[#D4A373] mb-6 border border-[#D4A373]/20">
              <span className="font-bold">02</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">
              {t("vision.title")}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed text-left">
              {t("vision.text")}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}