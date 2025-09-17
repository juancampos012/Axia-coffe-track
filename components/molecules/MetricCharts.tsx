import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import BarChart from "@/modules/dashboard/charts/BarChart";
import PieChart from "@/modules/dashboard/charts/PieChart";
import { formatCurrency } from "@/utils/format";
import { getDashboardMetrics } from "@/lib/api-analytics";

export default function MetricCharts() {
  const t = useTranslations("metrics");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datos para el gráfico de barras (ventas vs compras)
  const [financialData, setFinancialData] = useState({
    labels: [t("sales"), t("purchases")],
    datasets: [
      {
        label: t("amount"),
        data: [0, 0],
        backgroundColor: ["#60a5fa", "#1e3c8b"],
      }
    ],
  });
  
  // Datos para el gráfico circular (distribución de entidades)
  const [entityData, setEntityData] = useState({
    labels: [t("suppliers"), t("customers"), t("pendingOrders")],
    datasets: [
      {
        label: t("count"),
        data: [0, 0, 0],
        backgroundColor: ["#1e3c8b", "#60a5fa", "#93c5fd"],
        borderColor: ["#1e3c8b", "#60a5fa", "#93c5fd"],
      },
    ],
  });

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const dashboardData = await getDashboardMetrics();
        
        // Actualizar datos financieros (ventas vs compras)
        setFinancialData({
          labels: [t("sales"), t("purchases")],
          datasets: [
            {
              label: t("amount"),
              data: [
                dashboardData.sales.total || 0,
                dashboardData.purchases.total || 0
              ],
              backgroundColor: ["#60a5fa", "#1e3c8b"],
            }
          ],
        });
        
        // Actualizar datos de entidades (proveedores, clientes, órdenes)
        setEntityData({
          labels: [t("suppliers"), t("customers"), t("pendingOrders")],
          datasets: [
            {
              label: t("count"),
              data: [
                dashboardData.suppliersTotal || 0,
                dashboardData.clientsTotal || 0,
                dashboardData.pendingOrders || 0
              ],
              backgroundColor: ["#1e3c8b", "#60a5fa", "#93c5fd"],
              borderColor: ["#1e3c8b", "#60a5fa", "#93c5fd"],
            },
          ],
        });
        
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err instanceof Error ? err.message : "Error fetching data");
        
        // Datos de fallback en caso de error
        setFinancialData({
          labels: [t("sales"), t("purchases")],
          datasets: [
            {
              label: t("amount"),
              data: [680000, 425120],
              backgroundColor: ["#60a5fa", "#1e3c8b"],
            }
          ],
        });
        
        setEntityData({
          labels: [t("suppliers"), t("customers"), t("pendingOrders")],
          datasets: [
            {
              label: t("count"),
              data: [245, 1589, 458],
              backgroundColor: ["#1e3c8b", "#60a5fa", "#93c5fd"],
              borderColor: ["#1e3c8b", "#60a5fa", "#93c5fd"],
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAnalyticsData();
  }, [t]);

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
      </div>
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-5 h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-homePrimary"></div>
      </div>
    </div>;
  }

  if (error) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
      <div className="bg-black/50 border border-red-500/20 rounded-lg p-5 h-64 flex items-center justify-center text-red-400">
        <p>Error loading analytics data: {error}</p>
      </div>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
      {/* Gráfico de Ventas vs Compras */}
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-base font-medium mb-2 text-gray-200">{t("financialComparison")}</h2>
        <BarChart 
          labels={financialData.labels} 
          datasets={financialData.datasets}
          height={180}
          horizontal={true}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <div>{t("totalSales")}: {formatCurrency(financialData.datasets[0].data[0])}</div>
          <div>{t("totalPurchases")}: {formatCurrency(financialData.datasets[0].data[1])}</div>
        </div>
      </div>

      {/* Gráfico de Distribución de Entidades */}
      <div className="bg-black/50 border border-homePrimary/20 rounded-lg p-4 backdrop-blur-sm">
        <h2 className="text-base font-medium mb-2 text-gray-200">{t("entityDistribution")}</h2>
        <PieChart 
          labels={entityData.labels} 
          datasets={entityData.datasets}
          height={180}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <div>{t("suppliers")}: {entityData.datasets[0].data[0]}</div>
          <div>{t("customers")}: {entityData.datasets[0].data[1]}</div>
          <div>{t("pendingOrders")}: {entityData.datasets[0].data[2]}</div>
        </div>
      </div>
    </div>
  );
}