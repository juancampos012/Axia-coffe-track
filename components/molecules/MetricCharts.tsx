'use client'

import { useMemo } from 'react'

import BarChart from '@/modules/dashboard/charts/BarChart'
import PieChart from '@/modules/dashboard/charts/PieChart'

import { formatCurrency } from '@/utils/format'
import { useDashboardData } from '@/modules/dashboard/hooks/useDashboardData'

export default function MetricCharts() {
  const {
    data: dashboardData,
    isLoading,
    isError
  } = useDashboardData()

  const financialData = useMemo(() => ({
    labels: ['Ventas', 'Préstamos pendientes'],
    datasets: [
      {
        label: 'Monto',
        data: [
          dashboardData?.sales.totalRevenue || 0,
          dashboardData?.operations.pendingLoans || 0
        ],
        backgroundColor: ['#60a5fa', '#1e3c8b']
      }
    ]
  }), [dashboardData])

  const stockData = useMemo(() => ({
    labels: [
      'Café',
      'Café verde',
      'Frijol',
      'Pasilla',
      'Cacao'
    ],
    datasets: [
      {
        label: 'Inventario',
        data: [
          dashboardData?.inventory.stock.coffee || 0,
          dashboardData?.inventory.stock.wetCoffee || 0,
          dashboardData?.inventory.stock.bean || 0,
          dashboardData?.inventory.stock.pasilla || 0,
          dashboardData?.inventory.stock.cacao || 0
        ],
        backgroundColor: [
          '#1e3c8b',
          '#60a5fa',
          '#93c5fd',
          '#3b82f6',
          '#1d4ed8'
        ],
        borderColor: [
          '#1e3c8b',
          '#60a5fa',
          '#93c5fd',
          '#3b82f6',
          '#1d4ed8'
        ]
      }
    ]
  }), [dashboardData])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
        {[1, 2].map(i => (
          <div
            key={i}
            className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 h-64 flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary" />
          </div>
        ))}
      </div>
    )
  }

  if (isError || !dashboardData) {
    return (
      <div className="bg-black/50 border border-red-500/20 rounded-lg p-5 text-red-400">
        Error cargando métricas del dashboard
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
      
      {/* Ventas vs Préstamos */}
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-base font-medium mb-2 text-gray-200">
          Comparación Financiera
        </h2>

        <BarChart
          labels={financialData.labels}
          datasets={financialData.datasets}
          height={180}
          horizontal
        />

        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <div>
            Total Ventas: {formatCurrency(financialData.datasets[0].data[0])}
          </div>
          <div>
            Préstamos pendientes: {formatCurrency(financialData.datasets[0].data[1])}
          </div>
        </div>
      </div>

      {/* Distribución Inventario */}
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-base font-medium mb-2 text-gray-200">
          Distribución Inventario
        </h2>

        <PieChart
          labels={stockData.labels}
          datasets={stockData.datasets}
          height={180}
        />

        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-400">
          {stockData.labels.map((label, i) => (
            <div key={label}>
              {label}: {stockData.datasets[0].data[i]}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}