"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { useBalance } from "@/context/BalanceContext"

import MetricCharts from "@/components/molecules/MetricCharts"
import CustomTable from "@/components/organisms/CustomTable"
import { getListproducts } from "@/lib/api-products"
import { ProductDAO } from "@/types/Api"

export default function DashboardPage() {
  const t = useTranslations("admin")
  const { balance, setBalance } = useBalance()

  const [products, setProducts] = useState<{ [key: string]: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const initialFetchDone = useRef(false)

  // 1. SOLUCIÓN AL WARNING: fetchAllProducts con useCallback
  const fetchAllProducts = useCallback(async (sortParams?: { sortBy: string, order: 'asc' | 'desc' }) => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
        const res = await getListproducts(sortParams)
        if (res && Array.isArray(res)) {
            // 2. FILTRADO DE DATOS: Mapeamos solo id, código y producto
            const formatted = res.map((product: ProductDAO) => ({
                id: product.id,
                código: product.id,
                producto: product.name,
            }))
            setProducts(formatted)
        }
    } catch (err) {
        console.error('Error al obtener productos:', err)
    } finally {
        setIsLoading(false)
    }
  }, [isLoading]) 

  // 3. EFECTO CORREGIDO: Ahora fetchAllProducts es una dependencia estable
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllProducts()
      initialFetchDone.current = true
    }
  }, [fetchAllProducts])

  // 4. CABECERAS SIMPLIFICADAS: Solo Código y Producto
  const tableHeaders = [
    { label: t("headers.code"), key: "código"},
    { label: t("headers.product"), key: "producto"},
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>Vista general de tu negocio</p>
        </div>
      </div>

      <MetricCharts />
      
      <div className="pt-6">
        {isLoading && <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(74,127,255,0.6)" }}>Cargando productos...</p>}
        
        <CustomTable
          title={t("tableTitle")}
          headers={tableHeaders}
          options={false}
          // Filtramos cualquier posible resultado vacío
          data={products.filter(p => p.id !== "no-results")}
          contextType="products"
        />
      </div>
    </>
  )
}