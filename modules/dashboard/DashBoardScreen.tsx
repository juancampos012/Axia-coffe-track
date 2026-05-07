'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useDashboardData } from './hooks/useDashboardData'
import { useBalance } from '@/context/BalanceContext'
import { 
  Eye, 
  EyeOff, 
  FileText, 
  TrendingUp, 
  Package, 
  Coffee, 
  Bean, 
  AlertCircle, 
  Briefcase 
} from 'lucide-react'

import DashBoardLayout from './DashBoardLayout'
import SalesWidget from './widgets/SalesWidget'

export default function DashboardScreen() {
  const t = useTranslations('dashboard')
  const { balance, isVisible, toggleVisibility } = useBalance()
  const [isLoadingUI, setIsLoadingUI] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Consumimos el hook que ya tiene la nueva interfaz DashboardMetricsData
  const { data: companyData, isError, isLoading: isDataLoading } = useDashboardData()

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setIsLoadingUI(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: any): string => {
    if (!isVisible) return '••••••'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))
  }

  if (!mounted) return null 

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a1120] text-white">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <div className="text-red-500 text-xl mb-4 italic font-black uppercase tracking-tighter">
            Error de Conexión con Axia
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-[#1E3C8b] hover:bg-blue-700 rounded-full uppercase text-xs font-bold transition-all"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  // Combinamos el loading de la UI inicial con el del fetch de datos
  const showSpinner = isLoadingUI || isDataLoading

  return (
    <div className="relative min-h-screen bg-[#0a1120] text-white overflow-x-hidden">
      {/* Imagen de fondo con overlay suave */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/Images/fondoHerooo.png" 
          alt="Background" 
          fill 
          priority 
          className="object-cover opacity-20" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1120]/50 to-[#0a1120]" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* HEADER PRINCIPAL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Control Panel<span className="text-[#1E3C8b]">.</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">
              Sistema de Gestión Agrícola e Inventario
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex items-center gap-4 shadow-2xl">
              <div className="flex flex-col">
                <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Balance de Caja</span>
                <span className="text-2xl font-mono font-black tracking-tighter">
                  {formatCurrency(companyData?.inventory.balance || balance)}
                </span>
              </div>
              <button 
                onClick={toggleVisibility} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
              >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {showSpinner ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E3C8b]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* 1. SECCIÓN DE INVENTARIO FÍSICO (Datos de Company) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <InventoryCard 
                  title="Café Seco" 
                  value={companyData?.inventory.stock.coffee} 
                  icon={<Coffee />} 
                  color="text-amber-500" 
               />
               <InventoryCard 
                  title="Cacao" 
                  value={companyData?.inventory.stock.cacao} 
                  icon={<Bean />} 
                  color="text-orange-800" 
               />
               <InventoryCard 
                  title="Café Mojado" 
                  value={companyData?.inventory.stock.wetCoffee} 
                  icon={<Package />} 
                  color="text-blue-400" 
               />
               <InventoryCard 
                  title="Préstamos" 
                  value={companyData?.operations.pendingLoans} 
                  icon={<Briefcase />} 
                  color="text-red-500" 
                  isCurrency 
               />
            </div>

            {/* 2. LAYOUT DE WIDGETS Y REPORTES */}
            <DashBoardLayout>
              
              {/* Columna de Ventas (Ocupa 2 espacios en grid si es necesario) */}
              <div className="lg:col-span-2 space-y-6">
                <SalesWidget/>
                
                {/* Mini reporte de contratos activos */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <TrendingUp size={14} /> Contratos Activos
                      </h3>
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">
                        {companyData?.operations.activeContracts} Fijaciones
                      </span>
                   </div>
                   <p className="text-slate-400 text-xs italic">
                     Actualmente tienes {companyData?.operations.activeContracts} negociaciones pendientes por liquidar.
                   </p>
                </div>
              </div>

              {/* 3. COLUMNA LATERAL: FACTURACIÓN RECIENTE */}
              <div className="lg:col-span-1">
                 <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 h-full backdrop-blur-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                      <FileText size={14} /> Facturación Reciente
                    </h3>
                    <div className="space-y-4">
                      {companyData?.sales.recent && companyData.sales.recent.length > 0 ? (
                        companyData.sales.recent.slice(0, 6).map((inv: any) => (
                          <div key={inv.id} className="flex justify-between items-center p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/5 transition-colors group">
                             <div>
                               <p className="text-[10px] font-black text-white uppercase group-hover:text-blue-400 transition-colors">
                                 {inv.client?.firstName} {inv.client?.lastName}
                               </p>
                               <p className="text-[9px] text-slate-500 font-mono">
                                 {new Date(inv.date).toLocaleDateString()}
                               </p>
                             </div>
                             <span className="text-xs font-mono font-bold text-emerald-400">
                               {formatCurrency(inv.totalPrice)}
                             </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-600 text-xs uppercase font-bold italic">
                          No hay facturas registradas
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </DashBoardLayout>
          </div>
        )}
      </div>
    </div>
  )
}

// Subcomponente estilizado para las tarjetas de inventario
function InventoryCard({ title, value, icon, color, isCurrency = false }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] hover:border-[#1E3C8b]/50 transition-all group relative overflow-hidden shadow-xl">
      {/* Decoración de fondo de la card */}
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { size: 100 })}
      </div>

      <div className={`${color} bg-white/5 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{title}</p>
      
      <div className="flex items-baseline gap-1 mt-1">
        <h4 className="text-2xl font-black text-white tracking-tighter">
          {isCurrency ? (
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0))
          ) : (
            Number(value || 0).toLocaleString()
          )}
        </h4>
        {!isCurrency && <span className="text-[10px] font-bold text-slate-600 uppercase">Kg</span>}
      </div>
      
      <div className="mt-4 h-1 w-12 bg-[#1E3C8b] rounded-full group-hover:w-full transition-all duration-700" />
    </div>
  )
}