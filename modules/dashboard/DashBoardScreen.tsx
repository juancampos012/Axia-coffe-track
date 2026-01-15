'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useDashboardData } from './hooks/useDashboardData'
import { useBalance } from '@/context/BalanceContext'
import { resetCompanyBalance } from "@/request/payment";

import DashBoardLayout from './DashBoardLayout'
import SalesWidget from './widgets/SalesWidget'
import ProductsWidget from './widgets/ProductsWidget'
import InventoryWidget from './widgets/InventoryWidget'
import CustomersWidget from './widgets/CustomersWidget'
import ProfitabilityWidget from './widgets/ProfitabilityWidget'

export default function DashboardScreen() {
  const t = useTranslations('dashboard')
  const { balance, setBalance } = useBalance()
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const { data, isError } = useDashboardData()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleResetBalance = async () => {
    if (!confirm('¿Estás seguro de querer poner el balance en 0?\n\nEsta acción no se puede deshacer y requiere permisos de administrador.')) {
      return
    }

    try {
      setIsResetting(true)
      
      // Llamada a la API para resetear el balance
      const result = await resetCompanyBalance()
      
      // Actualizar el contexto local con el nuevo balance (0)
      setBalance(0)
      
      // Mostrar mensaje de éxito con detalles de la API
      alert(`✅ ${result.message}\n\nBalance anterior: ${formatCurrency(result.company.previousBalance)}\nNuevo balance: ${formatCurrency(result.company.newBalance)}`)
      
    } catch (error: any) {
      console.error('Error al resetear balance:', error)
      alert(`❌ ${error.message || 'Error al actualizar el balance. Verifica que tengas permisos de administrador.'}`)
    } finally {
      setIsResetting(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-red-500 text-xl mb-4">{t('errorLoading')}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-homePrimary text-white rounded-md"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <Image 
        src="/Images/fondoHerooo.png" 
        alt="Background" 
        fill 
        className="absolute inset-0 object-cover opacity-10" 
      />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-homePrimary">{t('title')}</h1>
          
          {/* Panel de balance */}
          <div className="flex gap-3">
            {balance !== null && (
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm">Balance:</span>
                <span className={`font-bold text-lg ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            )}
            
            <button
              onClick={handleResetBalance}
              disabled={isResetting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Poner balance en 0 (solo administradores)"
            >
              {isResetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resetear Balance
                </>
              )}
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-homePrimary"></div>
          </div>
        ) : (
          <DashBoardLayout>
            <SalesWidget />
            <ProductsWidget />
            <InventoryWidget />
            <CustomersWidget />
            <ProfitabilityWidget />
          </DashBoardLayout>
        )}
      </div>
    </div>
  )
}