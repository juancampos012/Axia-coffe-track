import { useLocale } from "next-intl";
import { BrandSection } from "../molecules/homeFooter/BrandSection";
import { LinksColumn } from "../molecules/homeFooter/Links";

interface HomeFooterProps { style: string; }

export default function HomeFooter({ style }: HomeFooterProps) {
  const locale = useLocale();
  const quickLinks = [
    { href: `/${locale}/`, label: "Inicio" },
    { href: `/${locale}/aboutus`, label: "Nuestra Solución" },
    { href: `/${locale}/contactus`, label: "Soporte Técnico" },
    { href: `/${locale}/pricing`, label: "Planes" },
  ];
  const copyrightLinks = [
    { href: `/${locale}/privacy`, label: "Privacidad de Datos" },
    { href: `/${locale}/terms`, label: "Términos del Servicio" },
    { href: `/${locale}/security`, label: "Seguridad de la Información" },
  ];

  return (
    <footer className={style} style={{ borderTop: '1px solid rgba(30,60,139,0.2)', background: '#04060f', paddingTop: 64, paddingBottom: 32 }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-3">
            <BrandSection />
            <p className="mt-4 text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Tecnología colombiana diseñada para modernizar la compra y venta de café pergamino en todo el país.
            </p>
          </div>
          <LinksColumn title="Navegación" links={quickLinks} />
          <LinksColumn title="Legal" links={copyrightLinks} />
        </div>

        <div
          className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs uppercase tracking-widest font-medium"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}
        >
          <div>&copy; {new Date().getFullYear()} AXIA COFFEE TRACK. TODOS LOS DERECHOS RESERVADOS.</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Sistemas Operativos 100% Online
          </div>
        </div>
      </div>
    </footer>
  );
}