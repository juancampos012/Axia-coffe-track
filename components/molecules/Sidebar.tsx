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
  Wallet,
} from "lucide-react";

import { useUserStore } from "@/store/UserStore";

type MenuItem = {
  icon: React.ComponentType<{ className?: string; size?: number }>;
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

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const sidebarRef = useRef<HTMLElement>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, setRole } = useUserStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        isOpen
      ) {
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

  const basePath =
    role === "USER" ? `/${locale}/employee` : `/${locale}/admin`;

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: t("home"),
      href: basePath,
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
    },
    {
      icon: ShoppingCart,
      label: "Operaciones",
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Comprar (caja)", href: `/${locale}/sales/make-sales` },
        {
          label: "Ver compras",
          href: `/${locale}/sales/sales-invoices`,
          allowedRoles: ["ADMIN", "SUPERADMIN"],
        },
        ...(role !== "USER"
          ? [
              { label: "Crear Ingreso", href: `/${locale}/shopping/make-purchase` },
              { label: "Ver Ingresos", href: `/${locale}/shopping/view-purchases` },
              { label: "Proveedores", href: `/${locale}/shopping/suppliers` },
            ]
          : []),
      ],
    },
    {
      icon: Wallet,
      label: "Finanzas",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Nuevo Gasto", href: `/${locale}/expenses/new` },
        { label: "Ver Gastos", href: `/${locale}/expenses` },
        { label: "Nuevo Préstamo", href: `/${locale}/loans/new-loan` },
        { label: "Ver Préstamos", href: `/${locale}/loans/view-loan` },
      ],
    },
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
    ...(role !== "USER"
      ? [
          {
            icon: BarChart2,
            label: "Dashboard",
            href: `/${locale}/admin/dashboard`,
            allowedRoles: ["ADMIN", "SUPERADMIN"] as string[],
          },
        ]
      : []),
  ];

  const filteredItems = menuItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role)
  );

  return (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-[57px] h-[calc(100vh-57px)] flex flex-col py-4 gap-1 transition-all duration-300 ease-in-out z-50 ${
        isOpen ? "w-64" : "w-16 items-center"
      }`}
      style={{
        background: "rgba(4,6,18,0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(30,60,139,0.2)",
      }}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-0.5">
        {filteredItems.map(({ icon: Icon, label, href, subOptions }, index) => (
          <div key={`${label}-${index}`} className="w-full">
            {subOptions ? (
              <>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    openMenu === label ? "bg-white/5" : "hover:bg-white/[0.04]"
                  } ${!isOpen ? "justify-center" : ""}`}
                  onClick={() => toggleMenu(label)}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`flex-shrink-0 transition-colors ${
                        openMenu === label
                          ? "text-[#4a7fff]"
                          : "text-white/35 group-hover:text-white/70"
                      }`}
                    />
                    {isOpen && (
                      <span
                        className={`text-sm font-medium transition-colors ${
                          openMenu === label
                            ? "text-white"
                            : "text-white/50 group-hover:text-white/80"
                        }`}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    openMenu === label ? (
                      <ChevronUp size={14} className="text-white/30 flex-shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-white/20 flex-shrink-0 group-hover:text-white/40" />
                    )
                  )}
                </button>

                {subOptions && isOpen && openMenu === label && (
                  <div className="mt-0.5 mb-1 ml-4 pl-4 space-y-0.5"
                    style={{ borderLeft: "1px solid rgba(30,60,139,0.35)" }}
                  >
                    {subOptions.map((sub, i) => (
                      <Link
                        key={`${sub.label}-${i}`}
                        href={sub.href}
                        className="block py-2 px-2 text-xs rounded-lg transition-all duration-150 hover:bg-white/5"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "rgba(74,127,255,0.9)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
                        }
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={href || "#"}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group hover:bg-white/[0.04] ${
                  !isOpen ? "justify-center" : ""
                }`}
              >
                <Icon
                  size={18}
                  className="flex-shrink-0 text-white/35 group-hover:text-[#4a7fff] transition-colors"
                />
                {isOpen && (
                  <span className="text-sm font-medium text-white/50 group-hover:text-white/80 transition-colors">
                    {label}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div
        className="px-2 pt-3 mt-2 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <button
          onClick={() => {
            Cookies.remove("authToken", { path: "/" });
            useUserStore.getState().setRole(null);
            window.location.href = `/${locale}/login`;
          }}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all duration-200 hover:bg-red-500/10 group ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <LogOut
            size={18}
            className="flex-shrink-0 text-red-500/50 group-hover:text-red-400 transition-colors"
          />
          {isOpen && (
            <span className="text-sm font-medium text-red-500/50 group-hover:text-red-400 uppercase tracking-wider transition-colors">
              {t("logout")}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
