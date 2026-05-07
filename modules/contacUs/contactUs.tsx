'use client';

import { useTranslations } from 'next-intl';

export default function ContactUs() {
  const t = useTranslations('contactUs');

  const onsubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Información enviada');
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-black py-32 flex flex-col items-center justify-center"
    >
      {/* Fondo degradado corregido a dorado/café sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4A373]/10 via-black/95 to-black opacity-90 blur-[100px]" />

      <div className="relative z-10 max-w-4xl w-full px-6 text-center mt-20">
        {/* Título con más margen para que no lo tape el Navbar */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          {t('title')}
        </h2>
        <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
          {t('description')}
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={onsubmit}>
          {/* Nombre */}
          <div className="text-left">
            <label className="text-[#D4A373] text-xs font-bold uppercase mb-2 block ml-1">Nombre</label>
            <input
              type="text"
              placeholder={t('form.name')}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all"
            />
          </div>

          {/* Email */}
          <div className="text-left">
            <label className="text-[#D4A373] text-xs font-bold uppercase mb-2 block ml-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder={t('form.email')}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all"
            />
          </div>

          {/* Teléfono */}
          <div className="text-left">
            <label className="text-[#D4A373] text-xs font-bold uppercase mb-2 block ml-1">Teléfono</label>
            <input
              type="text"
              placeholder={t('form.phone')}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all"
            />
          </div>

          {/* Asunto */}
          <div className="text-left">
            <label className="text-[#D4A373] text-xs font-bold uppercase mb-2 block ml-1">Asunto</label>
            <input
              type="text"
              placeholder={t('form.subject')}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all"
            />
          </div>

          {/* Mensaje - Ocupa 2 columnas */}
          <div className="md:col-span-2 text-left">
            <label className="text-[#D4A373] text-xs font-bold uppercase mb-2 block ml-1">Mensaje</label>
            <textarea
              placeholder={t('form.message')}
              className="w-full h-40 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition-all resize-none"
            />
          </div>

          {/* Botón Centrado */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              className="bg-[#D4A373] hover:bg-[#b88a5d] text-black px-12 py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 shadow-lg shadow-[#D4A373]/20"
            >
              {t('form.send')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}