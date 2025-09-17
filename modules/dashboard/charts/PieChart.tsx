'use client'

import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
  title?: string
  height?: number
}

export default function PieChart({ 
  labels, 
  datasets, 
  title, 
  height = 300 
}: PieChartProps) {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#fff',
          font: {
            size: 11
          },
          padding: 15
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
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            // Ensure value is a number
            const value = typeof context.raw === 'number' ? context.raw : 0;
            
            // Safely calculate total with null checks
            const dataArray = context.chart.data.datasets[0].data || [];
            const total = dataArray.reduce((acc, current) => {
              const accValue = typeof acc === 'number' ? acc : 0; // Ensure acc is a number
              const currentValue = typeof current === 'number' ? current : 0;
              return accValue + currentValue;
            }, 0);
            
            // Calculate percentage with type check on total
            const totalAsNumber = typeof total === 'number' ? total : 0;
            const percentage = totalAsNumber > 0 ? Math.round((value / totalAsNumber) * 100) : 0;
            
            return `${label}: ${percentage}% (${value})`;
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
      <Pie options={options} data={data} />
    </div>
  )
}