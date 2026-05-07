'use client';
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Hero() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0C0A09]">
      <div className="absolute inset-0">
        <Image
          src="/Images/textura-cafe.jpg" 
          alt="Textura Café"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0A09] via-[#0C0A09]/90 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10 pt-20">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          <div className={`md:col-span-7 transition-all duration-1000 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            <div className="inline-flex items-center gap-2 bg-[#D4A373]/10 backdrop-blur-md px-5 py-2 rounded-full text-sm mb-6 border border-[#D4A373]/30 text-[#D4A373]">
              <span className="animate-pulse">●</span>
              Especializado en Café
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter mb-6 text-white">
              La tecnología que tu <span className="text-[#D4A373]">compraventa</span> merece.
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
              Axia Coffee Track automatiza el cálculo de **Factor de Rendimiento**, gestiona inventarios en bodega y asegura que cada gramo cuente.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="bg-[#D4A373] hover:bg-[#b88a5d] text-black transition-all text-lg font-bold px-10 py-4 rounded-xl flex items-center gap-3 group">
                Digitalizar mi Negocio
                <span className="group-hover:translate-x-1 transition">→</span>
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
              <div className="flex flex-col gap-1">
                <span className="text-white text-lg">100%</span>
                Precisión
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white text-lg">Cálculos</span>
                Automáticos
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white text-lg">Cloud</span>
                Acceso desde cualquier lugar
              </div>
            </div>
          </div>

          {/* Mockup con sombra dorada */}
          <div className={`md:col-span-5 transition-all duration-1000 delay-300 ${
            isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#D4A373]/20 rounded-full blur-3xl" />
              <Image
                src="/Images/WhatsApp Image 2026-04-29 at 11.22.38-Photoroom.png" // Deberías crear un mockup que muestre una tabla de liquidación
                alt="Axia Coffee Track Interface"
                width={600}
                height={600}
                className="relative z-10 drop-shadow-[0_20px_50px_rgba(212,163,115,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}