"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useBalance } from "@/context/BalanceContext"

import MetricCharts from "@/components/molecules/MetricCharts"
import CustomTable from "@/components/organisms/CustomTable"
import { getListproducts } from "@/lib/api-products"
import { ProductDAO } from "@/types/Api"
import { resetCompanyBalance } from "@/request/payment" // Importar la función de API

export default function DashboardPage() {
  const t = useTranslations("admin")
  const { balance, setBalance } = useBalance()

  const [initialProducts, setInitialProducts] = useState<{ [key: string]: string }[]>([])
  const [products, setProducts] = useState<{ [key: string]: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const initialFetchDone = useRef(false)
    
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllProducts()
      initialFetchDone.current = true
    }
  }, [])

  const fetchAllProducts = async (sortParams?: { sortBy: string, order: 'asc' | 'desc' }) => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
        const res = await getListproducts(sortParams)
        if (res && Array.isArray(res)) {
            formatAndSetInitialProducts(res) 
        }
    } catch (err) {
        console.error('Error al obtener productos:', err)
    } finally {
        setIsLoading(false)
    }
  }

  const formatAndSetInitialProducts = (productList: ProductDAO[]) => {
    const formattedProducts = productList.map((product: ProductDAO) => ({
        id: product.id,
        código: product.id,
        producto: product.name,
        proveedor: product.supplier?.name || 'N/A',
        impuesto: product.tax?.toString() || '0',
        stock: product.stock?.toString() || '0',
        'p. compra': product.purchasePrice?.toString() || '0',
        'p. venta': product.salePrice?.toString() || '0',
    }))
    setInitialProducts(formattedProducts)
    setProducts(formattedProducts)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleResetBalance = async () => {
    if (!confirm('¿Estás seguro de querer poner el balance en 0?\n\n⚠️ Esta acción requiere permisos de administrador y no se puede deshacer.')) {
      return
    }

    try {
      setIsResetting(true)
      
      // Llamada a la API para resetear el balance
      const result = await resetCompanyBalance()
      
      // Actualizar el contexto local con el nuevo balance (0)
      setBalance(0)
      
      // Mostrar mensaje de éxito con detalles de la API
      alert(`✅ ${result.message || 'Balance actualizado a 0 correctamente'}`)
      
    } catch (error: any) {
      console.error('Error al resetear balance:', error)
      alert(`❌ ${error.message || 'Error al actualizar el balance. Verifica que tengas permisos de administrador.'}`)
    } finally {
      setIsResetting(false)
    }
  }

  const tableHeaders = [
    { label: t("headers.code"), key: "código"},
    { label: t("headers.product"), key: "producto"},
    { label: t("headers.supplier"), key: "proveedor"},
    { label: t("headers.tax"), key: "impuesto"},
    { label: t("headers.stock"), key: "stock"},
    { label: t("headers.purchasePrice"), key: "p. compra"},
    { label: t("headers.salePrice"), key: "p. venta"}
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm">Vista general de tu negocio</p>
        </div>
        
        {/* Panel de balance */}
        <div className="flex items-center gap-4">
          {balance !== null && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Balance actual</span>
                  <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
                
                <div className="h-10 w-px bg-gray-600"></div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleResetBalance}
                    disabled={isResetting}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                    title="Poner balance en 0 (solo administradores)"
                  >
                    {isResetting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span className="ml-1">Procesando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="ml-1">Resetear</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MetricCharts />
      <div className="pt-6">
        <CustomTable
          title={t("tableTitle")}
          headers={tableHeaders}
          options={false}
          data={products.filter(p => p.id !== "no-results")}
          contextType="products"
        />
      </div>
    </>
  )
}