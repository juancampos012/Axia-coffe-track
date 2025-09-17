'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartProps {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
  title?: string
  height?: number
  horizontal?: boolean
}

export default function BarChart({ 
  labels, 
  datasets, 
  title, 
  height = 300,
  horizontal = false
}: BarChartProps) {
  const options: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' as const : 'x' as const,
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
      title: {
        display: !!title,
        text: title || '',
        color: '#fff',
        font: {
          size: 14,
          weight: 'normal'
        }
      },
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
    }
  }

  const data = {
    labels,
    datasets
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Bar options={options} data={data} />
    </div>
  )
}