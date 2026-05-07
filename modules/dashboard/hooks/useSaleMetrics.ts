import { useEffect, useState } from 'react'
import { envVariables } from '@/utils/config'
import { SalesMetricsData } from '@/types/Api'

export function useSalesMetrics(period: string) {
  const [data, setData] = useState<SalesMetricsData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setIsError(false)

        const res = await fetch(
          `${envVariables.API_URL}/analytics/sales?period=${period}&limit=6`,
          { credentials: 'include' }
        )

        if (!res.ok) throw new Error()

        setData(await res.json())
      } catch {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [period])

  return { data, isLoading, isError }
}