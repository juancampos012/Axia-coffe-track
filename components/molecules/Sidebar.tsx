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
  LogOut,
  BarChart2,
  Layers,
  Wallet
} from "lucide-react";

import { useUserStore } from "@/store/UserStore";

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authToken = Cookies.get("authToken");
    if (authToken) {
      try {
        const decoded: { role?: UserRole } = jwtDecode(authToken);
        if (decoded.role) setRole(decoded.role);
      } catch (error) {
        console.error("Token inválido", error);
        Cookies.remove("authToken");
      }
    }
    setLoading(false);
  }, [setRole]);

  const toggleMenu = (label: string) => {
    if (isOpen) setOpenMenu(openMenu === label ? null : label);
  };

  if (loading || !role) return null;

  const basePath = role === "USER" ? `/${locale}/employee` : `/${locale}/admin`;

  const menuItems: MenuItem[] = [
    { 
      icon: Home, 
      label: t("home"), 
      href: basePath,
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"]
    },
    // --- 1. OPERACIONES COMERCIALES ---
    { 
      icon: ShoppingCart, 
      label: "Operaciones",
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Comprar(caja)", href: `/${locale}/sales/make-sales` },
        { label: "Ver compras", href: `/${locale}/sales/sales-invoices`, allowedRoles: ["ADMIN", "SUPERADMIN"] },
        ...(role !== "USER" ? [
          { label: "Crear Ingreso", href: `/${locale}/shopping/make-purchase` },
          { label: "Ver Ingresos", href: `/${locale}/shopping/view-purchases` },
          { label: "Proveedores", href: `/${locale}/shopping/suppliers` },
        ] : []),
      ],
    },
    // --- 2. FINANZAS Y CAJA ---
    {
      icon: Wallet,
      label: "Finanzas",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Nuevo Gasto", href: `/${locale}/expenses/new` },
        { label: "Ver Gastos", href: `/${locale}/expenses/view` },
        { label: "Nuevo Préstamo", href: `/${locale}/loans/new-loan` },
        { label: "Ver Préstamos", href: `/${locale}/loans/view-loan` },
      ],
    },
    // --- 3. LOGÍSTICA Y ALIADOS ---
    {
      icon: Truck,
      label: "Logística",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Ver Aliados", href: `/${locale}/partners` },
        { label: "Nuevo Aliado", href: `/${locale}/partners/new` },
        { label: "Control de Empaques", href: `/${locale}/packaging` },
        { label: "Ver Entregas", href: `/${locale}/delivery` },
        { label: "Nueva Entrega", href: `/${locale}/delivery/new` },
      ],
    },
    // --- 4. GESTIÓN Y COMUNICACIÓN ---
    { 
      icon: Layers, 
      label: "Gestión",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Clientes", href: `/${locale}/users/customers` },
        { label: "Empleados", href: `/${locale}/users/employees` },
        { label: "Crear Anuncio", href: `/${locale}/announcements` },
        { label: "Ver Anuncios", href: `/${locale}/announcements/view` },
      ],
    },
    ...(role !== "USER" ? [{ 
      icon: BarChart2, 
      label: "Dashboard",
      href: `/${locale}/admin/dashboard`,
      allowedRoles: ["ADMIN", "SUPERADMIN"]
    }] : []),
  ];

  // Filtro de seguridad
  const filteredItems = menuItems.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(role)
  );

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col py-6 px-3 gap-2 transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-700 z-50 ${
        isOpen ? "w-64" : "w-16 items-center"
      }`}
    >
      {filteredItems.map(({ icon: Icon, label, href, subOptions }, index) => (
        <div key={`${label}-${index}`} className="w-full">
          {subOptions ? (
            <div 
              className={`flex items-center justify-between p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group ${
                openMenu === label ? "bg-gray-700/70" : ""
              }`}
              onClick={() => toggleMenu(label)}
            >
              <div className="flex items-center gap-4">
                <Icon className="w-5 text-gray-400 group-hover:text-white transition-colors" />
                {isOpen && <span className="text-gray-200 text-sm font-medium group-hover:text-white">{label}</span>}
              </div>
              {isOpen && (
                <div className="ml-3">
                  {openMenu === label ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              )}
            </div>
          ) : (
            <Link 
              href={href || "#"}
              className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
            >
              <Icon className="w-5 text-gray-400 group-hover:text-white transition-colors" />
              {isOpen && <span className="text-gray-200 text-sm font-medium group-hover:text-white">{label}</span>}
            </Link>
          )}
          
          {subOptions && isOpen && openMenu === label && (
            <div className="pl-9 pt-1 pb-2 space-y-1">
              {subOptions.map((sub, i) => (
                <Link 
                  key={`${sub.label}-${i}`} 
                  href={sub.href} 
                  className="block py-1.5 text-gray-400 text-[13px] hover:text-white transition-colors border-l border-gray-700 pl-4"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="mt-auto border-t border-gray-700 pt-4">
        <button 
          onClick={() => {
            Cookies.remove("authToken", { path: "/" });
            useUserStore.getState().setRole(null);
            window.location.href = `/${locale}/login`;
          }}
          className={`flex items-center gap-4 p-3 w-full rounded-xl text-red-400 transition-all duration-200 hover:bg-red-500/10 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5" />
          {isOpen && <span className="text-sm font-bold uppercase tracking-wider">{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
}