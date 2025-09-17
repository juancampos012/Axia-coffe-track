'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useDashboardData } from './hooks/useDashboardData'

import DashBoardLayout from './DashBoardLayout'
import SalesWidget from './widgets/SalesWidget'
import ProductsWidget from './widgets/ProductsWidget'
import InventoryWidget from './widgets/InventoryWidget'
import CustomersWidget from './widgets/CustomersWidget'
import ProfitabilityWidget from './widgets/ProfitabilityWidget'

export default function DashboardScreen() {
  const t = useTranslations('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const { data, isError } = useDashboardData()

  useEffect(() => {
    // Simular un tiempo de carga para mejor UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

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
        <h1 className="text-3xl font-bold text-homePrimary mb-8">{t('title')}</h1>
        
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