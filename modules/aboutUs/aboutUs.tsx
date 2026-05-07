'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AboutUs() {
  const t = useTranslations("aboutUs");

  return (
    <section className="relative bg-black py-32 overflow-hidden">
      {/* Fondo con un brillo radial muy sutil en el centro */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4A373]/5 blur-[120px] rounded-full -z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        
        {/* ENCABEZADO */}
        <div className="mb-24">
          <h2 className="text-[#D4A373] text-xs font-bold uppercase tracking-[0.5em] mb-6">
            El Factor Humano
          </h2>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            {t("title")}
          </h1>
          <p className="text-gray-500 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
            {t("description")}
          </p>
        </div>

        {/* CONTENEDOR DE PERSONAS (Sin cuadros) */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-20 md:gap-32">
          
          {/* PERSONA 1 */}
          <div className="group flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8">
              {/* Efecto de aura detrás de la foto al hacer hover */}
              <div className="absolute inset-0 bg-[#D4A373] rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
              
              <Image
                src="/Images/22495.png"
                alt="Juan Campos"
                fill
                className="rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
            </div>
            
            <h3 className="text-3xl text-white font-bold tracking-tight mb-2">
              Juan Campos
            </h3>
            <p className="text-[#D4A373] text-sm font-bold uppercase tracking-widest mb-3">
              {t("person.role")}
            </p>
            <div className="h-px w-12 bg-gray-800 mb-4 group-hover:w-20 group-hover:bg-[#D4A373] transition-all duration-500" />
            <p className="text-gray-500 text-sm max-w-[200px]">
              {t("person.title")}
            </p>
          </div>

          {/* PERSONA 2 */}
          <div className="group flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8">
              <div className="absolute inset-0 bg-[#D4A373] rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
              
              <Image
                src="/Images/22495.png"
                alt="Santiago Jimenez"
                fill
                className="rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
              />
            </div>
            
            <h3 className="text-3xl text-white font-bold tracking-tight mb-2">
              Santiago Jimenez
            </h3>
            <p className="text-[#D4A373] text-sm font-bold uppercase tracking-widest mb-3">
              {t("person.role")}
            </p>
            <div className="h-px w-12 bg-gray-800 mb-4 group-hover:w-20 group-hover:bg-[#D4A373] transition-all duration-500" />
            <p className="text-gray-500 text-sm max-w-[200px]">
              {t("person.title")}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}