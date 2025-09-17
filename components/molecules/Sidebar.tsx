"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useTranslations, useLocale } from "next-intl";
import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Home, 
  Truck, 
  ShoppingCart,
  ChevronDown, 
  ChevronUp, 
  HandCoins, 
  ArchiveRestore, 
  LogOut,
  BarChart2
} from "lucide-react";

import { useUserStore } from "@/store/UserStore";
import LanguageSelector from "@/components/atoms/LanguageSelector";

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  subOptions?: {
    label: string;
    href: string;
    allowedRoles?: string[];
  }[];
  allowedRoles?: string[];
};

type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | null;

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const sidebarRef = useRef<HTMLElement>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, setRole } = useUserStore();

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Verificar el token al montar el componente
  useEffect(() => {
    if (typeof window === "undefined") return;

    const authToken = Cookies.get("authToken");
    if (authToken) {
      try {
        const decoded: { role?: UserRole } = jwtDecode(authToken);
        if (decoded.role) {
          setRole(decoded.role);
        }
      } catch (error) {
        console.error("Token inválido", error);
        Cookies.remove("authToken");
      }
    } else {
      console.warn("No authToken in cookies");
    }
    setLoading(false);
  }, [setRole]);

  // Cerrar menús cuando el sidebar se colapsa
  useEffect(() => {
    if (!isOpen) setOpenMenu(null);
  }, [isOpen]);

  const toggleMenu = (label: string) => {
    if (isOpen) {
      setOpenMenu(openMenu === label ? null : label);
    }
  };

  if (loading || !role) {
    return (
      <aside className="fixed top-16 left-0 h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center w-56 shadow-2xl border-r border-gray-700">
        <div className="animate-pulse text-gray-300">{t("loading")}</div>
      </aside>
    );
  }

  const basePath = role === "USER" ? `/${locale}/employee` : `/${locale}/admin`;

  const menuItems: MenuItem[] = [
    { 
      icon: Home, 
      label: t("home"), 
      href: basePath,
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"]
    },
    { 
      icon: Truck, 
      label: t("shopping"),
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
      subOptions: [
        { 
          label: t("makeSales"),
          href: `/${locale}/sales/make-sales`,
          allowedRoles: ["USER", "ADMIN", "SUPERADMIN"]
        },
        { 
          label: t("viewSales"),
          href: `/${locale}/sales/sales-invoices`,
          allowedRoles: ["ADMIN", "SUPERADMIN"]
        },        
        { 
          label: t("products"), 
          href: `/${locale}/store/products`,
          allowedRoles: ["USER", "ADMIN", "SUPERADMIN"]
        },
      ],
    },
    { 
      icon: ShoppingCart, 
      label: t("sales"),
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
      subOptions: [
        ...(role === "ADMIN" || role === "SUPERADMIN" ? [
          { 
            label: t("makePurchase"),
            href: `/${locale}/shopping/make-purchase`,
            allowedRoles: ["ADMIN", "SUPERADMIN"]
          }
        ] : []),
        ...(role === "ADMIN" || role === "SUPERADMIN" ? [
          { 
            label: t("viewPurchase"),
            href: `/${locale}/shopping/view-purchases`,
            allowedRoles: ["ADMIN", "SUPERADMIN"]
          }
        ] : []),
        ...(role === "ADMIN" || role === "SUPERADMIN" ? [
          { 
            label: t("supplier"),
            href: `/${locale}/shopping/suppliers`,
            allowedRoles: ["ADMIN", "SUPERADMIN"]
          }
        ] : []),
      ],
    },
    ...(role === "ADMIN" || role === "SUPERADMIN" ? [
      { 
        icon: User, 
        label: t("users"),
        allowedRoles: ["ADMIN", "SUPERADMIN"],
        subOptions: [
          { 
            label: t("customers"), 
            href: `/${locale}/users/customers`,
            allowedRoles: ["ADMIN", "SUPERADMIN"]
          },
          { 
            label: t("employees"),
            href: `/${locale}/users/employees`,
            allowedRoles: ["ADMIN", "SUPERADMIN"]
          },
        ],
      },
      { 
        icon: BarChart2, 
        label: t("dashboard"),
        href: `/${locale}/admin/dashboard`,
        allowedRoles: ["ADMIN", "SUPERADMIN"]
      },
    ] : []),
  ];

  // Filtrar items y subopciones basado en el rol
  const filteredItems = menuItems
    .filter(item => !item.allowedRoles || item.allowedRoles.includes(role))
    .map(item => ({
      ...item,
      subOptions: item.subOptions?.filter(
        sub => !sub.allowedRoles || sub.allowedRoles.includes(role)
      )
    }))
    .filter(item => !item.subOptions || item.subOptions.length > 0);

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col py-6 px-3 gap-2 transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-700 z-50 ${
        isOpen ? "w-64" : "w-16 items-center"
      }`}
    >
      {filteredItems.map(({ icon: Icon, label, href, subOptions }, index) => (
        <div key={`${label}-${index}`} className="w-full">
          <div 
            className={`flex items-center justify-between p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group ${
              openMenu === label ? "bg-gray-700/70" : ""
            }`}
            onClick={() => subOptions ? toggleMenu(label) : undefined}
          >
            <Link 
              href={href || "#"} 
              className="flex items-center gap-4"
              onClick={(e) => {
                if (subOptions) {
                  e.preventDefault();
                  toggleMenu(label);
                }
              }}
            >
              <Icon className="w-5 text-gray-300 group-hover:text-white transition-colors" />
              {isOpen && <span className="text-gray-200 text-sm font-medium group-hover:text-white">{label}</span>}
            </Link>

            {subOptions && isOpen && (
              <div className="ml-3">
                {openMenu === label ? (
                  <ChevronUp className="h-5 w-5 text-gray-300 group-hover:text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-300 group-hover:text-white" />
                )}
              </div>
            )}
          </div>
          
          {subOptions && isOpen && openMenu === label && (
            <div className="pl-10 pt-2 pb-1 bg-gray-800/30 rounded-lg mt-1">
              {subOptions.map((sub, i) => (
                <Link 
                  key={`${sub.label}-${i}`} 
                  href={sub.href} 
                  className="block py-2 text-gray-400 text-sm hover:text-white hover:bg-gray-700/50 rounded-md px-3 transition-all duration-200"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="w-full">
        <div className="flex items-center justify-between rounded-xl transition-all duration-200 cursor-pointer  py-2">
          <LanguageSelector variant="sidebar" isCollapsed={!isOpen} />
        </div>
      </div>

      <div className="mt-auto px-3 py-2">
        <Link 
          href={`/${locale}/login`}
          onClick={(e) => {
            e.preventDefault(); 
            Cookies.remove("authToken");
            Cookies.remove("authToken", { path: "/" });
            Cookies.remove("authToken", { path: "/", domain: ".axiainvoice.lat" });
            useUserStore.getState().setRole(null);
            window.location.href = `/${locale}/login`;
          }}
          className={`flex items-center gap-4 p-3 rounded-xl text-white transition-all duration-200 hover:bg-gray-700/50 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-6 w-6 text-gray-300 hover:text-white" />
          {isOpen && <span className="text-gray-200 text-sm font-medium hover:text-white">{t("logout")}</span>}
        </Link>
      </div>
    </aside>
  );
}