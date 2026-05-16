"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  LogOut,
  BarChart2,
  Wallet,
  Package,
  Users,
  BookOpen,
} from "lucide-react";

import { useUserStore } from "@/store/UserStore";

type SubOption = {
  label: string;
  href: string;
  allowedRoles?: string[];
};

type MenuItem = {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  href?: string;
  exact?: boolean;
  subOptions?: SubOption[];
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
  const pathname = usePathname();
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

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const isGroupActive = (subOptions?: SubOption[]) =>
    subOptions?.some((sub) => isActive(sub.href)) ?? false;

  // Auto-abre el grupo activo cuando el sidebar está abierto
  useEffect(() => {
    if (!isOpen || !role) return;
    menuItems.forEach(({ label, subOptions }) => {
      if (subOptions && isGroupActive(subOptions)) {
        setOpenMenu(label);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pathname]);

  if (loading || !role) return null;

  const basePath =
    role === "USER" ? `/${locale}/employee` : `/${locale}/admin`;

  const menuItems: MenuItem[] = [
    {
      icon: Home,
      label: t("home"),
      href: basePath,
      exact: true,
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
    },
    {
      icon: BarChart2,
      label: "Dashboard",
      href: `/${locale}/admin/dashboard`,
      allowedRoles: ["ADMIN", "SUPERADMIN"],
    },
    // ─── OPERACIONES ────────────────────────────────────────
    {
      icon: ShoppingCart,
      label: "Operaciones",
      allowedRoles: ["USER", "ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Comprar (caja)", href: `/${locale}/sales/make-sales` },
        { label: "Compra por Factor", href: `/${locale}/shopping/factor-purchase` },
        {
          label: "Ver Compras",
          href: `/${locale}/sales/sales-invoices`,
          allowedRoles: ["ADMIN", "SUPERADMIN"],
        },
      ],
    },
    // ─── INVENTARIO ─────────────────────────────────────────
    {
      icon: Package,
      label: "Inventario",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Control de Empaques", href: `/${locale}/packaging` },
        { label: "Nueva Entrega", href: `/${locale}/delivery/new` },
        { label: "Ver Entregas", href: `/${locale}/delivery/view` },
        { label: "Crear Anuncio", href: `/${locale}/announcements` },
        { label: "Ver Anuncios", href: `/${locale}/announcements/view` },
      ],
    },
    // ─── FINANZAS ────────────────────────────────────────────
    {
      icon: Wallet,
      label: "Finanzas",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Nuevo Gasto", href: `/${locale}/expenses/new` },
        { label: "Ver Gastos", href: `/${locale}/expenses/view` },
      ],
    },
    // ─── CUENTAS ─────────────────────────────────────────────
    {
      icon: BookOpen,
      label: "Cuentas",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Cuentas Aliados", href: `/${locale}/accounts/partners` },
        { label: "Cuentas Clientes", href: `/${locale}/accounts/clients` },
        { label: "Cuentas Proveedores", href: `/${locale}/accounts/suppliers` },
      ],
    },
    // ─── PERSONAS ────────────────────────────────────────────
    {
      icon: Users,
      label: "Personas",
      allowedRoles: ["ADMIN", "SUPERADMIN"],
      subOptions: [
        { label: "Clientes", href: `/${locale}/users/customers` },
        { label: "Empleados", href: `/${locale}/users/employees` },
        { label: "Aliados", href: `/${locale}/partners` },
        { label: "Nuevo Aliado", href: `/${locale}/partners/new` },
        { label: "Proveedores", href: `/${locale}/shopping/suppliers` },
      ],
    },
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
        {filteredItems.map(({ icon: Icon, label, href, exact, subOptions }, index) => {
          const groupActive = isGroupActive(subOptions);
          const linkActive = href ? isActive(href, exact) : false;

          return (
            <div key={`${label}-${index}`} className="w-full">
              {subOptions ? (
                <>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      openMenu === label || groupActive
                        ? "bg-white/5"
                        : "hover:bg-white/[0.04]"
                    } ${!isOpen ? "justify-center" : ""}`}
                    onClick={() => toggleMenu(label)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`flex-shrink-0 transition-colors ${
                          openMenu === label || groupActive
                            ? "text-[#4a7fff]"
                            : "text-white/35 group-hover:text-white/70"
                        }`}
                      />
                      {isOpen && (
                        <span
                          className={`text-sm font-medium transition-colors ${
                            openMenu === label || groupActive
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
                    <div
                      className="mt-0.5 mb-1 ml-4 pl-4 space-y-0.5"
                      style={{ borderLeft: "1px solid rgba(30,60,139,0.35)" }}
                    >
                      {subOptions.map((sub, i) => {
                        const subActive = isActive(sub.href);
                        return (
                          <Link
                            key={`${sub.label}-${i}`}
                            href={sub.href}
                            className={`flex items-center gap-2 py-2 px-2 text-xs rounded-lg transition-all duration-150 ${
                              subActive
                                ? "bg-[#4a7fff]/10 font-semibold"
                                : "hover:bg-white/5"
                            }`}
                            style={{
                              color: subActive
                                ? "rgba(74,127,255,1)"
                                : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {subActive && (
                              <span
                                className="w-1 h-1 rounded-full flex-shrink-0"
                                style={{ background: "#4a7fff" }}
                              />
                            )}
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={href || "#"}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    linkActive
                      ? "bg-[#4a7fff]/10"
                      : "hover:bg-white/[0.04]"
                  } ${!isOpen ? "justify-center" : ""}`}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                      linkActive
                        ? "text-[#4a7fff]"
                        : "text-white/35 group-hover:text-[#4a7fff]"
                    }`}
                  />
                  {isOpen && (
                    <span
                      className={`text-sm font-medium transition-colors ${
                        linkActive
                          ? "text-white font-semibold"
                          : "text-white/50 group-hover:text-white/80"
                      }`}
                    >
                      {label}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
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