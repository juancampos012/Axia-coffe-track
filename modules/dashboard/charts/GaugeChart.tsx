'use client'

import React from 'react'

interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  title?: string
  formatValue?: (value: number) => string
  thresholds?: {
    value: number
    color: string
  }[]
}

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  formatValue = (v) => `${v}%`,
  thresholds = [
    { value: 30, color: '#ef4444' }, // red
    { value: 70, color: '#eab308' }, // yellow
    { value: 100, color: '#22c55e' } // green
  ]
}: GaugeChartProps) {
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max((value - min) / (max - min), 0), 1)
  
  // Calculate angle for the needle (0 = -90deg, 1 = 90deg)
  const angle = -90 + (normalizedValue * 180)
  
  // Get appropriate color based on thresholds
  const getColor = () => {
    const normalizedThresholds = thresholds.map(t => ({
      value: (t.value - min) / (max - min),
      color: t.color
    })).sort((a, b) => a.value - b.value)
    
    for (const threshold of normalizedThresholds) {
      if (normalizedValue <= threshold.value) {
        return threshold.color
      }
    }
    
    return normalizedThresholds[normalizedThresholds.length - 1]?.color || '#22c55e'
  }
  
  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-lg font-medium mb-4 text-homePrimary-100">{title}</h3>}
      
      <div className="relative w-48 h-24">
        {/* Gauge Background */}
        <div className="absolute inset-0 h-full w-full bg-gray-800 rounded-t-full"></div>
        
        {/* Gauge Scale */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="relative h-full">
            {/* Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-t-full">
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30 rounded-t-full"></div>
            </div>
            
            {/* Tick marks */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
              <div 
                key={i}
                className="absolute bottom-0 w-0.5 h-4 bg-gray-400"
                style={{ 
                  left: `${tick * 100}%`, 
                  transform: `translateX(${tick === 0 ? '0%' : tick === 1 ? '-100%' : '-50%'})` 
                }}
              />
            ))}
            
            {/* Labels */}
            <div className="absolute bottom-4 left-0 text-xs text-gray-400">{min}</div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
              {min + (max - min) / 2}
            </div>
            <div className="absolute bottom-4 right-0 text-xs text-gray-400">{max}</div>
          </div>
        </div>
        
        {/* Needle */}
        <div 
          className="absolute left-1/2 bottom-0 w-1 h-20 bg-homePrimary origin-bottom transform -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-homePrimary shadow"></div>
        </div>
        
        {/* Center point */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gray-700 border-2 border-gray-600"></div>
      </div>
      
      {/* Value display */}
      <div className="mt-4 text-2xl font-bold text-center" style={{ color: getColor() }}>
        {formatValue(value)}
      </div>
    </div>
  )
}