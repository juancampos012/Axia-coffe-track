'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { envVariables } from '@/utils/config'
import { formatCurrency } from '@/utils/format'
import { InventorySummaryData } from '@/types/Api'

export default function InventoryWidget() {
  const t = useTranslations('dashboard.inventory')
  const [inventoryData, setInventoryData] = useState<InventorySummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchInventoryData() {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${envVariables.API_URL}/analytics/inventory`,
          { credentials: 'include' }
        )
        
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        
        const data = await response.json()
        setInventoryData(data)
      } catch (error) {
        console.error('Error fetching inventory data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInventoryData()
  }, [])
  
  return (
    <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-homePrimary mb-4">{t('title')}</h2>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
        </div>
      ) : inventoryData ? (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-xs text-gray-400">{t('totalProducts')}</div>
              <div className="text-xl font-bold">{inventoryData.summary.totalProducts}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-xs text-gray-400">{t('totalStock')}</div>
              <div className="text-xl font-bold">{inventoryData.summary.totalStock}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-xs text-gray-400">{t('inventoryValue')}</div>
              <div className="text-xl font-bold">{formatCurrency(inventoryData.summary.inventoryValue)}</div>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <div className="text-xs text-gray-400">{t('lowStockItems')}</div>
              <div className="text-xl font-bold text-red-500">{inventoryData.summary.lowStockCount}</div>
            </div>
          </div>
          
          {inventoryData.lowStockProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">{t('lowStockAlert')}</h3>
              <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 max-h-36 overflow-y-auto">
                {inventoryData.lowStockProducts.map(product => (
                  <div key={product.id} className="flex justify-between py-1 border-b border-red-800/20 last:border-0">
                    <span className="text-sm">{product.name}</span>
                    <span className="text-sm font-bold text-red-400">{product.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">{t('noData')}</div>
      )}
    </div>
  )
}