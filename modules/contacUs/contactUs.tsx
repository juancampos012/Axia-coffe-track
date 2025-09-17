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
      className="relative overflow-hidden bg-black py-20 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black/90 to-black opacity-95 blur-[100px]" />

      <div className="relative z-10 max-w-4xl px-4 text-center mt-10">
        <h2 className="text-4xl font-bold text-white mb-4">{t('title')}</h2>
        <p className="text-gray-300 text-lg mb-10">
          {t('description')}
        </p>

        <form className="space-y-6" onSubmit={onsubmit}>
          <div>
            <input
              type="text"
              placeholder={t('form.name')}
              className="w-full p-4 rounded-lg bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-homePrimary-200"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder={t('form.email')}
              className="w-full p-4 rounded-lg bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-homePrimary-200"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder={t('form.phone')}
              className="w-full p-4 rounded-lg bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-homePrimary-200"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder={t('form.subject')}
              className="w-full p-4 rounded-lg bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-homePrimary-200"
            />
          </div>

          <div>
              <textarea
                  placeholder={t('form.message')}
                  className="w-full h-40 p-4 rounded-lg bg-white/10 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-homePrimary-200"
              />
          </div>

          <button
            type="submit"
            className="bg-homePrimary hover:bg-primary text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            {t('form.send')}
          </button>
        </form>
      </div>
    </section>
  );
}
  