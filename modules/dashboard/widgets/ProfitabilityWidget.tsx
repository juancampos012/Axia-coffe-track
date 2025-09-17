'use client'

import { formatCurrency } from '@/utils/format'
import { ArrowDownRight, ArrowUpRight, Percent } from 'lucide-react'
import useWidgetData from '../hooks/useWidgetData'
import { ProfitabilityMetricsData } from '@/types/Api';
import { useTranslations } from 'next-intl'

export default function ProfitabilityWidget() {
  const t = useTranslations('dashboard.profitability')
  const { data, isLoading, error } = useWidgetData<ProfitabilityMetricsData>({
    endpoint: 'profitability'
  })
  
  if (isLoading) {
    return (
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-homePrimary mb-4">{t('title')}</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
        </div>
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-homePrimary mb-4">{t('title')}</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {t('noData')}
        </div>
      </div>
    )
  }
  
  // Valores de seguridad en caso de que falten datos
  const profitMargin = data.profitMargin || 0;
  const yearOverYearChange = data.yearOverYearChange || 0;
  const grossProfit = data.grossProfit || 0;
  const netProfit = data.netProfit || 0;
  const costBreakdown = data.costBreakdown || [];
  
  return (
    <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-homePrimary mb-4">{t('title')}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">{t('grossProfit')}</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(grossProfit)}</p>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">{t('netProfit')}</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(netProfit)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg mb-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">{t('profitMargin')}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-white">{profitMargin.toFixed(1)}%</p>
            <Percent className="w-4 h-4 ml-1 text-gray-400" />
          </div>
        </div>
        
        {/* ... resto del código ... */}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">{t('costBreakdown')}</h3>
        <div className="space-y-2">
          {costBreakdown.length > 0 ? (
            costBreakdown.map((item, index) => (
              <div key={index} className="bg-black/20 rounded-lg p-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    {item.category === 'Cost of Goods' && t('costOfGoods')}
                    {item.category === 'Operational Expenses' && t('operationalExpenses')}
                    {item.category === 'Net Profit' && t('netProfitCategory')}
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-black/20 rounded-lg p-2 text-center text-gray-400">
              {t('noData')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}