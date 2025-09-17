'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface LineChartProps {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill?: boolean
    tension?: number
  }[]
  title?: string
  height?: number
}

export default function LineChart({ labels, datasets, title, height = 300 }: LineChartProps) {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      title: {
        display: !!title,
        text: title || '',
        color: '#fff',
        font: {
          size: 14,
          weight: 'normal'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          display: false
        },
        ticks: {
          color: '#fff',
          font: {
            size: 10
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawOnChartArea: true,
          ...({borderDash: [5, 5]} as any)  
        },
        ticks: {
          color: '#fff',
          font: {
            size: 10
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  }

  const data = {
    labels,
    datasets
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Line options={options} data={data} />
    </div>
  )
}