"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl";

import MetricCharts from "@/components/molecules/MetricCharts"
import CustomTable from "@/components/organisms/CustomTable"
import { getListproducts } from "@/lib/api-products";
import { ProductDAO } from "@/types/Api";

export default function DashboardPage() {
  const t = useTranslations("admin");

  const [initialProducts, setInitialProducts] = useState<{ [key: string]: string }[]>([]);
  const [products, setProducts] = useState<{ [key: string]: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllProducts();
      initialFetchDone.current = true;
    }
  }, []);

  const fetchAllProducts = async (sortParams?: { sortBy: string, order: 'asc' | 'desc' }) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
        const res = await getListproducts(sortParams);
        if (res && Array.isArray(res)) {
            formatAndSetInitialProducts(res); 
        }
    } catch (err) {
        console.error('Error al obtener productos:', err);
    } finally {
        setIsLoading(false);
    }
  };

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
    }));
    setInitialProducts(formattedProducts);
    setProducts(formattedProducts);
  };

  const tableHeaders = [
    { label: t("headers.code"), key: "código"},
    { label: t("headers.product"), key: "producto"},
    { label: t("headers.supplier"), key: "proveedor"},
    { label: t("headers.tax"), key: "impuesto"},
    { label: t("headers.stock"), key: "stock"},
    { label: t("headers.purchasePrice"), key: "p. compra"},
    { label: t("headers.salePrice"), key: "p. venta"}
  ];
  

  return (
    <div className="p-4">

      <MetricCharts />
      <div className="pt-10">

        <CustomTable 
          title={t("tableTitle")}
          headers={tableHeaders}
          options={false} 
          data={products.filter(p => p.id !== "no-results")}
          contextType="products"
        />

      </div>
    </div>
  )
}