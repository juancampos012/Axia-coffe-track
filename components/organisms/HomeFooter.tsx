import { useTranslations, useLocale } from "next-intl";
import { BrandSection } from "../molecules/homeFooter/BrandSection";
import { LinksColumn } from "../molecules/homeFooter/Links";

interface HomeFooterProps {
    style: string;
}

export default function HomeFooter({style}: HomeFooterProps) {
    const t = useTranslations("footer");
    const locale = useLocale();

    // Enlaces de navegación rápida enfocados en el servicio
    const quickLinks = [
        { href: `/${locale}/`, label: "Inicio" },
        { href: `/${locale}/aboutus`, label: "Nuestra Solución" },
        { href: `/${locale}/contactus`, label: "Soporte Técnico" },
        { href: `/${locale}/pricing`, label: "Planes" },
    ];

    // Enlaces legales y de confianza
    const copyrightLinks = [
        { href: `/${locale}/privacy`, label: "Privacidad de Datos" },
        { href: `/${locale}/terms`, label: "Términos del Servicio" },
        { href: `/${locale}/security`, label: "Seguridad de la Información" },
    ];

    return (
        <footer className={`${style} py-16 border-`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
                    
                    {/* Sección de Marca: Ocupa más espacio */}
                    <div className="lg:col-span-3">
                        <BrandSection />
                        <p className="mt-4 text-gray-500 text-sm max-w-xs">
                            Tecnología colombiana diseñada para modernizar la compra y venta de café pergamino en todo el país.
                        </p>
                    </div>

                    {/* Columnas de Links */}
                    <LinksColumn
                        title="Navegación"
                        links={quickLinks}
                    />
                    <LinksColumn
                        title="Legal"
                        links={copyrightLinks}
                    />
                </div>
                
                {/* Línea final y Copyright */}
                <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs uppercase tracking-widest font-medium">
                    <div>
                        &copy; {new Date().getFullYear()} AXIA COFFEE TRACK. TODOS LOS DERECHOS RESERVADOS.
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Sistemas Operativos 100% Online
                    </div>
                </div>
            </div>
        </footer>
    );
}