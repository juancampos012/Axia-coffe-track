import React, { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
}

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'primary' 
}: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-homePrimary/10 border-homePrimary text-homePrimary',
    secondary: 'bg-blue-900/10 border-blue-700 text-blue-500',
    success: 'bg-green-900/10 border-green-700 text-green-500',
    danger: 'bg-red-900/10 border-red-700 text-red-500',
    warning: 'bg-yellow-900/10 border-yellow-700 text-yellow-500'
  }
  
  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} backdrop-blur-sm`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        {icon && <div className="text-xl">{icon}</div>}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-2xl md:text-3xl font-bold">{value}</span>
        
        {trend && (
          <span className={`ml-4 text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'} flex items-center`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  )
}