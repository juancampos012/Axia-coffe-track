'use client'

import { formatCurrency } from '@/utils/format'
import { Users, UserPlus, TrendingUp } from 'lucide-react'
import useWidgetData from '../hooks/useWidgetData'
import PieChart from '../charts/PieChart'
import { CustomerMetricsData } from '@/types/Api';
import { useTranslations } from 'next-intl'


export default function CustomersWidget() {
  const t = useTranslations('dashboard.customers')
  const { data, isLoading, error } = useWidgetData<CustomerMetricsData>({
    endpoint: 'customers'
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
  
  // Prepare chart data for customer segments
  const chartData = {
    labels: data.segments.map(segment => {
      switch(segment.name) {
        case "New (1 purchase)":
          return t('segments.new');
        case "Regular (2-3 purchases)":
          return t('segments.regular');
        case "Frequent (4+ purchases)":
          return t('segments.frequent');
        default:
          return segment.name;
      }
    }),
    datasets: [
      {
        label: t('customerCount'),
        data: data.segments.map(segment => segment.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }
  
  return (
    <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-homePrimary mb-4">{t('title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 p-4 rounded-lg flex items-center">
          <Users className="h-8 w-8 text-blue-400 mr-3" />
          <div>
            <p className="text-sm text-gray-400">{t('totalCustomers')}</p>
            <p className="text-xl font-bold">{data.totalCustomers}</p>
          </div>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg flex items-center">
          <UserPlus className="h-8 w-8 text-green-400 mr-3" />
          <div>
            <p className="text-sm text-gray-400">{t('newCustomers')}</p>
            <p className="text-xl font-bold">{data.newCustomers}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg mb-6 flex items-center">
        <TrendingUp className="h-8 w-8 text-yellow-400 mr-3" />
        <div>
          <p className="text-sm text-gray-400">{t('averageOrderValue')}</p>
          <p className="text-xl font-bold">{formatCurrency(data.averageOrderValue)}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">{t('segmentsTitle')}</h3>
        <div className="bg-black/30 p-4 rounded-lg h-64">
          <PieChart
            labels={chartData.labels}
            datasets={chartData.datasets}
            height={220}
          />
        </div>
      </div>
    </div>
  )
}