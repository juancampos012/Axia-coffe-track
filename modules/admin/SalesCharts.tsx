import { Line } from "react-chartjs-2"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function SalesCharts() {
  const months = ["March", "Spring", "May", "Summer 25", "Winter 25"]

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        type: "category",
        ticks: { autoSkip: false }, // Asegura que se muestren todas las etiquetas
        grid: { display: false }, // Desactiva la cuadrícula en el eje X
      },
      y: {
        type: "linear",
        beginAtZero: true,
        grid: { drawOnChartArea: false, drawTicks: false },
      },
    },
  }  
  
  const lineData = {
    labels: months,
    datasets: [
      {
        label: "PURCHASES",
        data: [30, 45, 28, 35, 42],
        borderColor: "#1e3c8b",
        backgroundColor: "#1e3c8b",
      },
      {
        label: "SALES",
        data: [25, 38, 32, 28, 38],
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa",
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  const salesData = {
    labels: months,
    datasets: [
      {
        data: [300, 450, 500, 280, 350],
        backgroundColor: "#60a5fa",
      },
    ],
  }

  const purchasesData = {
    labels: months,
    datasets: [
      {
        data: [250, 380, 420, 300, 400],
        backgroundColor: "#1e3c8b",
      },
    ],
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="bg-white p-10 pb-14 rounded-lg shadow-sm w-full h-[400px]">
        <h3 className="text-sm font-medium mb-4 text-center text-black">COMPARISON OF SALES AND PURCHASES FOR THE YEAR 2025</h3>
        <Line options={lineOptions} data={lineData} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-16 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-4 text-center text-black">SALES FOR THE YEAR 2025</h3>
          <Bar options={barOptions} data={salesData} />
        </div>
        <div className="bg-white p-16 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-4 text-center text-black">PURCHASES FOR THE YEAR 2025</h3>
          <Bar options={barOptions} data={purchasesData} />
        </div>
      </div>

    </div>
  )
}

