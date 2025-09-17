import { useTranslations } from "next-intl";

export default function MisionVision() {
  const t = useTranslations("misionVision");

  return (
    <section className="relative overflow-hidden bg-black py-20 flex flex-col items-center justify-center mt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-black/90 to-black opacity-95 blur-[100px]" />

      <div className="z-10 max-w-4xl px-4 mb-8 text-center mb-20">
        <h1 className="text-5xl font-bold text-white mb-4">{t("title")}</h1>
        <p className="text-gray-300 text-lg">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 z-10 max-w-4xl px-4">
        <div className="bg-white/10 p-6 rounded-lg shadow-lg text-center backdrop-blur-sm w-full md:w-[45%]">
          <h2 className="text-2xl font-semibold text-white mb-4">{t("mission.title")}</h2>
          <p style={{ textAlign: 'justify' }} className="text-gray-300">
            {t("mission.text")}
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-lg shadow-lg text-center backdrop-blur-sm w-full md:w-[45%]">
          <h2 className="text-2xl font-semibold text-white mb-4">{t("vision.title")}</h2>
          <p style={{ textAlign: 'justify' }} className="text-gray-300">
            {t("vision.text")}
          </p>
        </div>
      </div>
    </section>
  );
}
  