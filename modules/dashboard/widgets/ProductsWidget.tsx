'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { envVariables } from '@/utils/config'
import { formatCurrency } from '@/utils/format'
import { TopProductData } from '@/types/Api'

export default function ProductsWidget() {
  const t = useTranslations('dashboard.products')
  const [products, setProducts] = useState<TopProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchTopProducts() {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${envVariables.API_URL}/analytics/top-products?limit=5`,
          { credentials: 'include' }
        )
        
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching top products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTopProducts()
  }, [])
  
  // Calcula el máximo para la barra progresiva
  const maxSold = Math.max(...products.map(p => p.totalSold), 1)
  
  return (
    <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-homePrimary mb-4">{t('title')}</h2>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="bg-black/30 p-4 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-white">{product.productName}</span>
                <span className="text-sm font-medium text-gray-400">{product.totalSold} {t('units')}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-homePrimary h-2.5 rounded-full" 
                  style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-right text-xs text-gray-400">
                {formatCurrency(product.revenue)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}