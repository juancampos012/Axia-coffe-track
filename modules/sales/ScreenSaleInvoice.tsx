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
import { FileSpreadsheet, Search, X, Calendar } from "lucide-react";

export default function ScreenInvoices() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("saleInvoice");

  const [currentSort, setCurrentSort] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
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
      if (res && Array.isArray(res)) {
        setInvoicesXlsx(res);
        const formatted = res.map((invoice) => ({
          id: invoice.id,
          cliente: `${invoice.client?.firstName || "Nombre"} ${invoice.client?.lastName || "Desconocido"}`,
          fecha: new Date(invoice.date).toLocaleDateString(),
          total: `$${(invoice.totalPrice || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
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
      fetchInvoicesByDateRange(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
    }
  };

  const handleClearSearch = () => {
    setStartDate(null);
    setEndDate(null);
    setInvoices([]);
    setHasSearched(false);
  };

  const handleViewInvoice = (invoiceId: string) => router.push(`/${locale}/sales/sales-invoices/${invoiceId}`);

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteSaleInvoice(invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    } catch (err) {
      console.error("Error eliminando la factura:", err);
      alert(t("deleteError"));
    }
  };

  const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setCurrentSort({ field, direction });
    setInvoices(prev => [...prev].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    }));
  }, []);

  const handleExportExcel = async () => {
    if (!invoicesXlsx.length) return;
    const workbook = new ExcelJS.Workbook();
    const allProducts = new Set<string>();
    invoicesXlsx.forEach(inv => {
      (inv.invoiceProducts || []).forEach((p: any) => allProducts.add(p.product?.name || "Producto sin nombre"));
    });
    for (const prodName of Array.from(allProducts)) {
      const worksheet = workbook.addWorksheet(prodName);
      worksheet.addRow(["Cliente", "Fecha", `${prodName} (Cantidad)`, `${prodName} (Precio Unitario)`, `${prodName} (Total)`]);
      worksheet.getRow(1).eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3C8B" } };
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      invoicesXlsx.forEach(inv => {
        inv.invoiceProducts?.filter((p: any) => (p.product?.name || "Producto sin nombre") === prodName)
          ?.forEach((prod: any) => {
            const row = worksheet.addRow([
              `${inv.client?.firstName || ""} ${inv.client?.lastName || ""}`,
              new Date(inv.date).toLocaleDateString(),
              prod.quantity || 0,
              prod.unitPrice || prod.product?.salePrice || 0,
              prod.quantity && (prod.unitPrice || prod.product?.salePrice)
                ? prod.quantity * (prod.unitPrice || prod.product?.salePrice) : 0,
            ]);
            row.getCell(3).numFmt = '#,##0.##';
            row.getCell(4).numFmt = '$ #,##0';
            row.getCell(5).numFmt = '$ #,##0';
          });
      });
      const totalQty = invoicesXlsx.reduce((sum, inv) => sum + (inv.invoiceProducts?.filter((p: any) => (p.product?.name || "Producto sin nombre") === prodName) || []).reduce((s: number, p: any) => s + Number(p.quantity || 0), 0), 0);
      const totalSum = invoicesXlsx.reduce((sum, inv) => sum + (inv.invoiceProducts?.filter((p: any) => (p.product?.name || "Producto sin nombre") === prodName) || []).reduce((s: number, p: any) => s + (p.quantity || 0) * (p.unitPrice || p.product?.salePrice || 0), 0), 0);
      const totalRow = worksheet.addRow(["Totales", "", totalQty || 0, "", totalSum || 0]);
      totalRow.getCell(3).numFmt = '#,##0.##';
      totalRow.getCell(5).numFmt = '$ #,##0';
      totalRow.font = { bold: true };
      worksheet.columns.forEach(col => {
        let max = 0;
        if (typeof col.eachCell === "function") col.eachCell({ includeEmpty: true }, cell => { max = Math.max(max, (cell.value?.toString() || "").length); });
        col.width = max + 5;
      });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "reporte_facturas.xlsx");
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: '#0a1120', width: '100%' }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(74,127,255,0.7)' }}>
            Módulo de ventas
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}>
            Facturas de Compras
          </h1>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={!invoices.length}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: invoices.length ? 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' : 'rgba(255,255,255,0.05)',
            color: invoices.length ? '#fff' : 'rgba(255,255,255,0.25)',
            border: `1px solid ${invoices.length ? 'rgba(30,60,139,0.5)' : 'rgba(255,255,255,0.07)'}`,
            boxShadow: invoices.length ? '0 4px 16px rgba(30,60,139,0.3)' : 'none',
            cursor: invoices.length ? 'pointer' : 'not-allowed',
          }}
        >
          <FileSpreadsheet size={15} />
          Descargar Excel
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="rounded-2xl p-px mb-6" style={{ background: 'linear-gradient(135deg, rgba(30,60,139,0.4) 0%, rgba(74,127,255,0.1) 100%)' }}>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(8,12,28,0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="flex flex-wrap items-end gap-5">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0" style={{ background: 'rgba(30,60,139,0.2)', border: '1px solid rgba(30,60,139,0.35)' }}>
              <Calendar size={16} style={{ color: '#4a7fff' }} />
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-white/40">Desde</label>
                <DatePicker
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  slotProps={{ textField: { size: 'small', sx: { '& .MuiOutlinedInput-root': { color: '#fff' } } } }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-white/40">Hasta</label>
                <DatePicker
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                  slotProps={{ textField: { size: 'small', sx: { '& .MuiOutlinedInput-root': { color: '#fff' } } } }}
                />
              </div>
            </LocalizationProvider>

            <button
              onClick={handleDateSearch}
              disabled={!startDate || !endDate || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: startDate && endDate && !isLoading ? 'linear-gradient(135deg, #1e3c8b 0%, #13275a 100%)' : 'rgba(255,255,255,0.05)',
                color: startDate && endDate && !isLoading ? '#fff' : 'rgba(255,255,255,0.25)',
                height: 40,
              }}
            >
              <Search size={14} />
              {isLoading ? "Buscando..." : "Buscar"}
            </button>

            {hasSearched && (
              <button onClick={handleClearSearch} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white/50 border border-white/10" style={{ height: 40 }}>
                <X size={14} /> Limpiar
              </button>
            )}

            <div className="ml-auto">
              <TableFilter headers={tableHeaders} onSort={handleSort} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      {isLoading ? (
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-4">Cargando...</p>
      ) : !hasSearched ? (
        <div className="text-center py-20">
          <p className="text-sm font-bold uppercase tracking-widest text-white/30">
            Selecciona un rango de fechas para buscar facturas
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState message="No se encontraron facturas" />
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