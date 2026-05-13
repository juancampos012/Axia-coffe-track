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
                        className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}
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
                            sx={{
                              "& .MuiInputBase-root": { background: "rgba(255,255,255,0.04)", borderRadius: "12px", color: "white", fontSize: "13px" },
                              "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(30,60,139,0.4)" },
                              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)", fontSize: "12px" },
                              "& .MuiSvgIcon-root": { color: "rgba(74,127,255,0.7)" },
                            }}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-white">Hasta:</label>
                            <DatePicker
                                label="Fecha fin"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                sx={{
                              "& .MuiInputBase-root": { background: "rgba(255,255,255,0.04)", borderRadius: "12px", color: "white", fontSize: "13px" },
                              "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(30,60,139,0.4)" },
                              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)", fontSize: "12px" },
                              "& .MuiSvgIcon-root": { color: "rgba(74,127,255,0.7)" },
                            }}
                            />
                        </div>
                        
                        <button
                            onClick={handleDateSearch}
                            disabled={!startDate || !endDate || isLoading}
                            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)" }}
                        >
                            {isLoading ? "Buscando..." : "Buscar"}
                        </button>
                        
                        {hasSearched && (
                            <button
                                onClick={handleClearSearch}
                                className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                                style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
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
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 mt-4" style={{ color: "rgba(74,127,255,0.6)" }}>{t("loading")}</p>
            ) : !hasSearched ? (
                <div className="text-center py-8">
                    <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
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
