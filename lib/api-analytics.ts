import { 
  SalesMetricsData,
  TopProductData,
  InventorySummaryData,
  CustomerMetricsData,
  DashboardMetricsData,
  ProfitabilityMetricsData,
  InventoryHealthData,
  ProductPerformanceData,
  CustomerInsightsData
} from '@/types/Api';
import { envVariables } from "@/utils/config";

/**
 * Wrapper para fetch con credenciales y manejo de errores
 * @param url URL del endpoint de API
 * @param options Opciones de la petición
 * @returns Promesa con los datos de respuesta
 */
const fetchWithCredentials = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  console.log(`Analytics API request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `Error ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.message || 'Error en la solicitud de análisis');
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Analytics API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Obtiene métricas de ventas por período
 * @param period Período de tiempo (día, semana, mes)
 * @param limit Número de períodos a incluir
 * @returns Promesa con datos de métricas de ventas
 */
export const getSalesMetrics = async (period: string = 'month', limit: number = 6): Promise<SalesMetricsData[]> => {
  const url = `${envVariables.API_URL}/analytics/sales?period=${period}&limit=${limit}`;
  console.log(`Fetching sales metrics for period: ${period}, limit: ${limit}`);
  
  return fetchWithCredentials<SalesMetricsData[]>(url);
};

/**
 * Obtiene productos más vendidos
 * @param limit Número de productos a devolver
 * @returns Promesa con datos de productos top
 */
export const getTopProducts = async (limit: number = 5): Promise<TopProductData[]> => {
  const url = `${envVariables.API_URL}/analytics/top-products?limit=${limit}`;
  console.log(`Fetching top ${limit} products`);
  
  return fetchWithCredentials<TopProductData[]>(url);
};

/**
 * Obtiene resumen de inventario
 * @returns Promesa con datos de resumen de inventario
 */
export const getInventorySummary = async (): Promise<InventorySummaryData> => {
  const url = `${envVariables.API_URL}/analytics/inventory`;
  console.log('Fetching inventory summary');
  
  return fetchWithCredentials<InventorySummaryData>(url);
};

/**
 * Obtiene métricas de clientes
 * @returns Promesa con datos de métricas de clientes
 */
export const getCustomerMetrics = async (): Promise<CustomerMetricsData> => {
  const url = `${envVariables.API_URL}/analytics/customers`;
  console.log('Fetching customer metrics');
  
  return fetchWithCredentials<CustomerMetricsData>(url);
};

/**
 * Obtiene métricas generales del dashboard
 * @returns Promesa con datos de métricas del dashboard
 */
export const getDashboardMetrics = async (): Promise<DashboardMetricsData> => {
  const url = `${envVariables.API_URL}/analytics/dashboard`;
  console.log('Fetching dashboard metrics');
  
  return fetchWithCredentials<DashboardMetricsData>(url);
};

/**
 * Obtiene métricas de rentabilidad
 * @returns Promesa con datos de rentabilidad
 */
export const getProfitabilityMetrics = async (): Promise<ProfitabilityMetricsData> => {
  const url = `${envVariables.API_URL}/analytics/profitability`;
  console.log('Fetching profitability metrics');
  
  return fetchWithCredentials<ProfitabilityMetricsData>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Obtiene métricas de salud de inventario
 * @returns Promesa con datos de salud de inventario
 */
export const getInventoryHealth = async (): Promise<InventoryHealthData> => {
  const url = `${envVariables.API_URL}/analytics/inventory-health`;
  console.log('Fetching inventory health metrics');
  
  return fetchWithCredentials<InventoryHealthData>(url);
};

/**
 * Obtiene métricas de rendimiento de productos
 * @param period Período de tiempo (día, semana, mes)
 * @param limit Número de productos a incluir
 * @returns Promesa con datos de rendimiento de productos
 */
export const getProductPerformance = async (period: string = 'month', limit: number = 10): Promise<ProductPerformanceData> => {
  const url = `${envVariables.API_URL}/analytics/product-performance?period=${period}&limit=${limit}`;
  console.log(`Fetching product performance for period: ${period}, limit: ${limit}`);
  
  return fetchWithCredentials<ProductPerformanceData>(url);
};

/**
 * Obtiene insights de clientes
 * @returns Promesa con datos de insights de clientes
 */
export const getCustomerInsights = async (): Promise<CustomerInsightsData> => {
  const url = `${envVariables.API_URL}/analytics/customer-insights`;
  console.log('Fetching customer insights');
  
  return fetchWithCredentials<CustomerInsightsData>(url);
};