"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, Eye, EyeOff } from "lucide-react"; // Importamos los iconos del ojo
import Cookies from "js-cookie";

import CustomButton from "../atoms/CustomButton";
import Sidebar from "@/components/molecules/Sidebar";
import { getCompanyById } from "@/request/companies";
import { useBalance } from "@/context/BalanceContext"; 

type UserRole = "USER" | "ADMIN" | "SUPERADMIN" | null;

export default function HomeBox({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Extraemos lo necesario del context de balance
  const { 
    setBalance, 
    displayBalance, 
    isVisible, 
    toggleVisibility 
  } = useBalance(); 

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
            <span className="font-bold text-xl tracking-tight leading-none mb-1">AXIA</span>
            
            {/* CONTENEDOR DEL SALDO CON EL OJITO */}
            <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono font-bold text-sm">
              Saldo: {displayBalance}
            </span>
              
              <button 
                onClick={toggleVisibility}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                title={isVisible ? "Ocultar saldo" : "Mostrar saldo"}
              >
                {isVisible ? (
                  <EyeOff size={14} className="text-gray-400" />
                ) : (
                  <Eye size={14} className="text-green-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <main
          className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0 md:ml-16"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}