import { useTranslations, useLocale } from "next-intl";

import { BrandSection } from "../molecules/homeFooter/BrandSection";
import { LinksColumn } from "../molecules/homeFooter/Links";

interface HomeFooterProps {
    style: string;
}

export default function HomeFooter({style}: HomeFooterProps) {
    const t = useTranslations("footer");
    const locale = useLocale();

    const quickLinks = [
        { href: `/${locale}/`, label: t("quickLinks.home") },
        { href: `/${locale}/services`, label: t("quickLinks.services") },
        { href: `/${locale}/aboutus`, label: t("quickLinks.aboutUs") },
        { href: `/${locale}/contactus`, label: t("quickLinks.contact") },
    ];

    const copyrightLinks = [
        { href: `/${locale}/privacy`, label: t("copyright.privacy") },
        { href: `/${locale}/terms`, label: t("copyright.terms") },
        { href: `/${locale}/about`, label: t("copyright.about") },
    ];

    const socialLinks = [
        { href: "https://twitter.com", label: t("social.twitter") },
        { href: "https://discord.gg", label: t("social.discord") },
        { href: "https://github.com", label: t("social.github") },
    ];

    return (
        <footer className={`${style} py-12 mt-10`}>
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-20">
                    <BrandSection />
                    <LinksColumn
                        title={t("sections.quickLinks")}
                        links={quickLinks}
                    />
                    <LinksColumn
                        title={t("sections.copyright")}
                        links={copyrightLinks}
                    />
                    <LinksColumn
                        title={t("sections.social")}
                        links={socialLinks}
                    />
                </div>
                
                {/* Copyright */}
                <div className="mt-10 border-t border-gray-800 pt-4 text-center text-sm">
                    &copy;{new Date().getFullYear()} Axia. {t("copyrightText")}
                </div>
            </div>
        </footer>
    );
}