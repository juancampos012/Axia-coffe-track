"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import Cookies from "js-cookie";

import CustomButton from "../atoms/CustomButton";
import Sidebar from "@/components/molecules/Sidebar";
import { getCompanyById } from "@/request/companies";
import { useBalance } from "@/context/BalanceContext"; // Importa tu context

type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | null;

export default function HomeBox({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { balance: currentBalance, setBalance } = useBalance(); // Usamos el context aquí
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    if (!user) return;

    const role = Cookies.get("userRole");

    if (role === "USER" || role === "ADMIN" || role === "SUPERADMIN") {
      setUserRole(role);
    } else {
      setUserRole(null);
    }

    const fetchCompany = async () => {
      const companyId = user.tenantId;
      try {
        const company = await getCompanyById(companyId);
        console.log("Balance actual de la empresa:", company.currentBalance);
        setBalance(company.currentBalance);  
      } catch (error) {
        console.error("Error al obtener el balance:", error);
      }
    };

    fetchCompany();
  }, [user, setBalance]);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-950 text-white flex items-center justify-between p-4 shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <CustomButton
            onClickButton={() => setIsSidebarOpen(!isSidebarOpen)}
            icon={() => <Menu />}
            text=""
            iconColor="h-7 w-7 cursor-pointer text-gray-200 hover:text-white"
          />
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight">AXIA</span>
            {currentBalance !== null && (
              <span className="text-green-400 font-semibold text-sm">
                Saldo: ${currentBalance.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <main
          className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-16"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
