"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, Eye, EyeOff, X } from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";

import Sidebar from "@/components/molecules/Sidebar";
import { getCompanyById } from "@/request/companies";
import { useBalance } from "@/context/BalanceContext";

type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | null;

export default function HomeBox({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { setBalance, displayBalance, isVisible, toggleVisibility } = useBalance();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchCompany = async () => {
      try {
        const company = await getCompanyById(user.tenantId);
        setBalance(company.currentBalance);
      } catch (error) {
        console.error("Error al obtener el balance:", error);
      }
    };
    fetchCompany();
  }, [user, setBalance]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#04060f" }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(4,6,18,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(30,60,139,0.25)",
        }}
      >
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <Image
              src="/Images/logo_blanco.png"
              alt="Axia Logo"
              width={28}
              height={28}
              className="opacity-90"
            />
            <span
              className="hidden sm:block font-bold text-white text-sm tracking-tight"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}
            >
              AXIA <span style={{ color: "#4a7fff" }}>COFFEE</span>
            </span>
          </div>
        </div>

        {/* Right: balance pill */}
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(30,60,139,0.35)",
          }}
        >
          <div className="flex flex-col items-end">
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(74,127,255,0.8)" }}
            >
              Saldo de Caja
            </span>
            <span className="text-sm font-mono font-bold text-white leading-none">
              {displayBalance}
            </span>
          </div>
          <button
            onClick={toggleVisibility}
            className="p-1.5 rounded-lg transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {isVisible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Overlay mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main
          className={`flex-1 p-6 overflow-auto transition-all duration-300 min-h-[calc(100vh-57px)] ${
            isSidebarOpen ? "md:ml-64" : "md:ml-16"
          }`}
          style={{ background: "#04060f" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
