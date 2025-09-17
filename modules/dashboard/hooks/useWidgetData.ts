import { useState, useEffect } from 'react';
import { envVariables } from '@/utils/config';

interface UseWidgetDataProps<T> {
  endpoint: string;
  params?: Record<string, string>;
  initialData?: T;
  transformResponse?: (data: any) => T;
}

export default function useWidgetData<T>({
  endpoint,
  params = {},
  initialData,
  transformResponse
}: UseWidgetDataProps<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build query string from params
        const queryString = new URLSearchParams(params).toString();
        const url = `${envVariables.API_URL}/analytics/${endpoint}${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const rawData = await response.json();
        const processedData = transformResponse ? transformResponse(rawData) : rawData;
        
        setData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error('Error fetching widget data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [endpoint, refetchIndex, JSON.stringify(params)]);

  const refetch = () => setRefetchIndex(prev => prev + 1);

  return { data, isLoading, error, refetch };
}