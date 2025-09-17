import { useState, useEffect } from 'react';
import { envVariables } from '@/utils/config';
import { DashboardMetricsData } from '@/types/Api';


export function useDashboardData() {
  const [data, setData] = useState<DashboardMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setIsError(false);
        
        const response = await fetch(`${envVariables.API_URL}/analytics/dashboard`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return { data, isLoading, isError };
}