'use client'

import React, { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import LineChart from '../charts/LineChart'
import { formatCurrency } from '@/utils/format'
import { useSalesMetrics } from '../hooks/useSaleMetrics'

export default function SalesWidget() {
  const t = useTranslations('dashboard.sales')
  const [period, setPeriod] = useState<'week' | 'month'>('month')

  const { data, isLoading, isError } = useSalesMetrics(period)

  const totals = useMemo(() => ({
    revenue: data.reduce((sum, item) => sum + Number(item.revenue), 0),
    count: data.reduce((sum, item) => sum + Number(item.count), 0)
  }), [data])

  const chartData = useMemo(() => ({
    labels: data.map(i => i.period),
    datasets: [
      {
        label: t('revenue'),
        data: data.map(i => i.revenue),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: t('count'),
        data: data.map(i => i.count),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.2)',
        tension: 0.4
      }
    ]
  }), [data, t])

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
        Error cargando métricas de ventas
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">
          {t('title')}
        </h2>

        <div className="flex gap-2">
          {['week', 'month'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as 'week' | 'month')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                period === p
                  ? 'bg-[#1E3C8b] text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-blue-400 border-b-2" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard label={t('totalRevenue')} value={formatCurrency(totals.revenue)} />
            <MetricCard label={t('totalSales')} value={totals.count.toString()} />
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
      <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  )
}