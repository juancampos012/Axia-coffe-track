'use client';

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import EmptyState from '@/components/molecules/EmptyState';
import CustomTable from "@/components/organisms/CustomTable";
import { deleteSaleInvoice, searchInvoicesByDateRange } from "@/lib/api-saleInvoce";
import TableFilter from "@/components/molecules/TableFilter";

export default function ScreenInvoices() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("saleInvoice");

    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
    const [invoices, setInvoices] = useState<{ [key: string]: string }[]>([]);
    const [invoicesXlsx, setInvoicesXlsx] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const tableHeaders = [
        { label: t("headers.id"), key: "id" },
        { label: t("headers.client"), key: "cliente" },
        { label: t("headers.date"), key: "fecha" },
        { label: t("headers.total"), key: "total" },
    ];

    const fetchInvoicesByDateRange = async (start: string, end: string) => {
        if (!start || !end) return;

        setIsLoading(true);
        setHasSearched(true);

        try {
            const res = await searchInvoicesByDateRange(start, end);
            setInvoicesXlsx(res || []);

            if (res && Array.isArray(res)) {
                setInvoicesXlsx(res)
                console.log("Facturas obtenidas para Excel:", res);
                const formatted = res.map((invoice) => ({
                    id: invoice.id,
                    cliente: `${invoice.client?.firstName || "Nombre"} ${invoice.client?.lastName || "Desconocido"}`,
                    fecha: new Date(invoice.date).toLocaleDateString(),
                    total: `$${(invoice.totalPrice || 0).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })}`,
                }));

                setInvoices(formatted);
            }
        } catch (err) {
            console.error("Error al obtener facturas:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateSearch = () => {
        if (startDate && endDate) {
            fetchInvoicesByDateRange(
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD")
            );
        }
    };

    const handleClearSearch = () => {
        setStartDate(null);
        setEndDate(null);
        setInvoices([]);
        setHasSearched(false);
    };

    const handleViewInvoice = (invoiceId: string) => {
        router.push(`/${locale}/sales/sales-invoices/${invoiceId}`);
    };

    const handleDeleteInvoice = async (invoiceId: string) => {
        try {
            await deleteSaleInvoice(invoiceId);
            setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        } catch (err) {
            console.error("Error eliminando la factura:", err);
            alert(t("deleteError"));
        }
    };

    const sortInvoices = (data: { [key: string]: string }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const sorted = sortInvoices([...invoices], field, direction);
        setInvoices(sorted);
    }, [invoices]);

const handleExportExcel = async () => {
  if (!invoicesXlsx.length) return;

  const workbook = new ExcelJS.Workbook();

  // Recolectar todos los productos
  const allProducts = new Set<string>();
  invoicesXlsx.forEach(inv => {
    (inv.invoiceProducts || []).forEach((p: any) => {
      allProducts.add(p.product?.name || "Producto sin nombre");
    });
  });

  // Crear una hoja por producto
  for (const prodName of Array.from(allProducts)) {
    const worksheet = workbook.addWorksheet(prodName);

    // Encabezados
    worksheet.addRow([
      "Cliente",
      "Fecha",
      `${prodName} (Cantidad)`,
      `${prodName} (Precio Unitario)`,
      `${prodName} (Total)`
    ]);

    // Estilos de encabezado
    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" } // azul
      };
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Filas de datos
    invoicesXlsx.forEach(inv => {
      const prod = inv.invoiceProducts?.find((p: any) => (p.product?.name || "Producto sin nombre") === prodName);
      if (prod) {
        const row = worksheet.addRow([
          `${inv.client?.firstName || ""} ${inv.client?.lastName || ""}`,
          new Date(inv.date).toLocaleDateString(),
          prod.quantity || "",
          prod.unitPrice || prod.product?.salePrice || "",
          prod.quantity && (prod.unitPrice || prod.product?.salePrice) ? prod.quantity * (prod.unitPrice || prod.product?.salePrice) : ""
        ]);
      }
    });

    // Totales
    const totalQty = invoicesXlsx.reduce((sum, inv) => {
      const prod = inv.invoiceProducts?.find((p: any) => (p.product?.name || "Producto sin nombre") === prodName);
      return sum + (prod?.quantity || 0);
    }, 0);

    const totalSum = invoicesXlsx.reduce((sum, inv) => {
      const prod = inv.invoiceProducts?.find((p: any) => (p.product?.name || "Producto sin nombre") === prodName);
      return sum + ((prod?.quantity || 0) * (prod?.unitPrice || prod?.product?.salePrice || 0));
    }, 0);

    worksheet.addRow(["Totales", "", totalQty || "", "", totalSum || ""]);

    // Ajustar ancho de columnas
    worksheet.columns.forEach(col => {
      let maxLength = 0;
      if (typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, cell => {
          const value = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, value.length);
        });
      }
      col.width = maxLength + 5;
    });
  }

  // Exportar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "reporte_facturas.xlsx");
};
    return (
        <div className="container mx-auto">
            <div className="p-4 shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-homePrimary-200">Facturas de compras</h2>
                    <button
                        onClick={handleExportExcel}
                        disabled={!invoices.length}
                        className="px-6 py-2 bg-homePrimary text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                        Descargar Excel
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 mt-4">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="flex items-center gap-6 my-4 p-4 rounded-lg shadow-md">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-white">Desde:</label>
                            <DatePicker
                            label="Fecha inicio"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            className="rounded-lg bg-white"
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-white">Hasta:</label>
                            <DatePicker
                                label="Fecha fin"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                className="rounded-lg bg-white"
                            />
                        </div>
                        
                        <button
                            onClick={handleDateSearch}
                            disabled={!startDate || !endDate || isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? "Buscando..." : "Buscar"}
                        </button>
                        
                        {hasSearched && (
                            <button
                                onClick={handleClearSearch}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </LocalizationProvider>
                
                <TableFilter
                    headers={tableHeaders}
                    onSort={handleSort}
                />
            </div>

            {isLoading ? (
                <p className="text-gray-500 text-sm mb-2 mt-4">{t("loading")}</p>
            ) : !hasSearched ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                        Selecciona un rango de fechas para buscar facturas
                    </p>
                </div>
            ) : invoices.length === 0 ? (
                <EmptyState message="No se encontraron facturas en el rango de fechas seleccionado" />
            ) : (
                <CustomTable
                    title={t("tableTitle")}
                    headers={tableHeaders}
                    options={true}
                    data={invoices}
                    contextType="invoices"
                    customActions={{
                        view: handleViewInvoice,
                        delete: handleDeleteInvoice,
                    }}
                />
            )}
        </div>
    );
}
