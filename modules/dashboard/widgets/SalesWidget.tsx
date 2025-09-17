'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import LineChart from '../charts/LineChart'
import { envVariables } from '@/utils/config'
import { formatCurrency } from '@/utils/format'

import { SalesMetricsData } from '@/types/Api'

export default function SalesWidget() {
  const t = useTranslations('dashboard.sales')
  const [salesData, setSalesData] = useState<SalesMetricsData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  useEffect(() => {
    async function fetchSalesData() {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${envVariables.API_URL}/analytics/sales?period=${selectedPeriod}&limit=6`,
          { credentials: 'include' }
        )
        
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        
        const data = await response.json()
        setSalesData(data)
      } catch (error) {
        console.error('Error fetching sales data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSalesData()
  }, [selectedPeriod])
  
  const chartData = {
    labels: salesData.map(item => item.period),
    datasets: [
      {
        label: t('revenue'),
        data: salesData.map(item => item.revenue),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.5)',
        fill: true,
        tension: 0.4
      },
      {
        label: t('count'),
        data: salesData.map(item => item.count),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.5)',
        tension: 0.4
      }
    ]
  }
  
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0)
  const totalCount = salesData.reduce((sum, item) => sum + item.count, 0)
  
  return (
    <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm col-span-1 md:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-homePrimary">{t('title')}</h2>
        
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-xs rounded-md ${
              selectedPeriod === 'week' 
                ? 'bg-homePrimary text-white' 
                : 'bg-gray-800 text-gray-300'
            }`}
            onClick={() => setSelectedPeriod('week')}
          >
            {t('week')}
          </button>
          <button
            className={`px-3 py-1 text-xs rounded-md ${
              selectedPeriod === 'month' 
                ? 'bg-homePrimary text-white' 
                : 'bg-gray-800 text-gray-300'
            }`}
            onClick={() => setSelectedPeriod('month')}
          >
            {t('month')}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-gray-400">{t('totalRevenue')}</div>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-gray-400">{t('totalSales')}</div>
              <div className="text-2xl font-bold">{totalCount}</div>
            </div>
          </div>
          
          <LineChart 
            labels={chartData.labels} 
            datasets={chartData.datasets}
            height={250}
          />
        </>
      )}
    </div>
  )
}