'use client'

import React, { ReactNode } from 'react'

interface ChartWidgetProps {
  title: string
  children: ReactNode
  isLoading?: boolean
  error?: Error | null
  className?: string
  actions?: ReactNode
}

export default function ChartWidget({ 
  title, 
  children, 
  isLoading = false, 
  error = null,
  className = '',
  actions
}: ChartWidgetProps) {
  return (
    <div className={`bg-black/50 border border-homePrimary/20 rounded-lg p-5 backdrop-blur-sm ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-homePrimary">{title}</h2>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
        </div>
      ) : error ? (
        <div className="h-64 flex flex-col items-center justify-center text-red-400">
          <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-center">{error.message || 'Error loading data'}</p>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
