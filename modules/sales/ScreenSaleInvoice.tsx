'use client';

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import EmptyState from '@/components/molecules/EmptyState';
import CustomTable from "@/components/organisms/CustomTable";
import { deleteSaleInvoice, searchInvoicesByDateRange, viewSaleInvoicePDF, updateSaleInvoiceItem } from "@/lib/api-saleInvoce";
import { getCashMovements } from "@/lib/api-analytics";
import TableFilter from "@/components/molecules/TableFilter";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import { ProductDAO } from "@/types/Api";
import { useAuth } from "@/context/AuthContext";
import { useBalance } from "@/context/BalanceContext";
import { FileSpreadsheet, Search, X, Calendar, CalendarCheck, Receipt, Pencil, Loader2, Save } from "lucide-react";

const darkPickerTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4a7fff' },
    background: { paper: '#0a1120' },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'rgba(0,0,0,0.3)',
          '& fieldset': { borderColor: 'rgba(74,127,255,0.3)' },
          '&:hover fieldset': { borderColor: 'rgba(74,127,255,0.5)' },
          '&.Mui-focused fieldset': { borderColor: '#4a7fff' },
        },
        input: { color: '#fff' },
      },
    },
    MuiSvgIcon: { styleOverrides: { root: { color: 'rgba(255,255,255,0.4)' } } },
  },
});

export default function ScreenInvoices() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("saleInvoice");
  const { user } = useAuth();
  const { refreshBalance } = useBalance();

  const [currentSort, setCurrentSort] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  const [invoices, setInvoices] = useState<{ [key: string]: string }[]>([]);
  const [invoicesXlsx, setInvoicesXlsx] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  type EditableItem = {
    saleProductInvoiceId: string;
    productId: string;
    productName: string;
    quantity: string;
    unitPrice: string;
  };
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [editItems, setEditItems] = useState<EditableItem[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const handleTodaySearch = () => {
    const today = dayjs();
    setStartDate(today);
    setEndDate(today);
    fetchInvoicesByDateRange(today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"));
  };

  const handleClearSearch = () => {
    setStartDate(null);
    setEndDate(null);
    setInvoices([]);
    setHasSearched(false);
  };

  const handleViewInvoice = (invoiceId: string) => router.push(`/${locale}/sales/sales-invoices/${invoiceId}`);

  const handleEditInvoice = (invoiceId: string) => {
    const invoice = invoicesXlsx.find((inv) => inv.id === invoiceId);
    const items = invoice?.invoiceProducts || [];
    if (items.length === 0) {
      alert("Esta factura no tiene productos para editar.");
      return;
    }
    setEditingInvoice(invoice);
    setEditItems(
      items.map((it: any) => ({
        saleProductInvoiceId: it.id,
        productId: it.productId,
        productName: it.product?.name || "Producto",
        quantity: String(it.quantity),
        unitPrice: String(it.unitPrice ?? 0),
      }))
    );
  };

  const updateEditItem = (id: string, patch: Partial<EditableItem>) => {
    setEditItems((prev) => prev.map((it) => (it.saleProductInvoiceId === id ? { ...it, ...patch } : it)));
  };

  const handleSaveEditInvoice = async () => {
    if (!editingInvoice) return;
    try {
      setIsSavingEdit(true);
      await updateSaleInvoiceItem(editingInvoice.id, {
        items: editItems.map((it) => ({
          id: it.saleProductInvoiceId,
          productId: it.productId,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      });
      if (user?.tenantId) await refreshBalance(user.tenantId);
      if (startDate && endDate) {
        await fetchInvoicesByDateRange(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
      }
      setEditingInvoice(null);
      setEditItems([]);
    } catch (err: any) {
      alert(err.message || "Error al editar la factura");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleViewReceipt = async (invoiceId: string) => {
    try {
      await viewSaleInvoicePDF(invoiceId);
    } catch (err) {
      console.error("Error al obtener el recibo:", err);
      alert("No se pudo abrir el recibo.");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return;
    try {
      await deleteSaleInvoice(invoiceId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    } catch (err: any) {
      console.error("Error eliminando la factura:", err);
      alert(err?.message || t("deleteError"));
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
    const productTotals: { name: string; totalQty: number; totalSum: number }[] = [];
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

      productTotals.push({ name: prodName, totalQty: totalQty || 0, totalSum: totalSum || 0 });
    }

    // Hoja "Total": resumen por categoría (cantidad + valor) y gran total, como el reporte manual
    const totalSheet = workbook.addWorksheet("Total");
    productTotals.forEach(({ name, totalQty, totalSum }) => {
      const row = totalSheet.addRow([name, totalQty, totalSum]);
      row.getCell(1).font = { bold: true };
      row.getCell(2).numFmt = '#,##0.##';
      row.getCell(3).numFmt = '$ #,##0';
    });
    const grandTotal = productTotals.reduce((s, p) => s + p.totalSum, 0);
    const grandTotalRow = totalSheet.addRow(["", "", grandTotal]);
    grandTotalRow.getCell(3).numFmt = '$ #,##0';
    grandTotalRow.font = { bold: true };

    // Ingresos (abonos que nos hacen) y egresos (gastos) del mismo rango de fechas
    if (startDate && endDate) {
      try {
        const { incomes, expenses } = await getCashMovements(
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD")
        );

        // Bloque de Ingresos: columnas E/F
        totalSheet.getCell(1, 5).value = "Ingresos";
        totalSheet.getCell(1, 6).value = "Valor";
        totalSheet.getCell(1, 5).font = { bold: true };
        totalSheet.getCell(1, 6).font = { bold: true };
        incomes.forEach((inc, i) => {
          const r = i + 2;
          const label = inc.description && inc.description !== "Abono" ? `${inc.name} - ${inc.description}` : inc.name;
          totalSheet.getCell(r, 5).value = label;
          totalSheet.getCell(r, 6).value = inc.amount;
          totalSheet.getCell(r, 6).numFmt = "$ #,##0";
        });
        const incomesTotal = incomes.reduce((s, i) => s + i.amount, 0);
        const incTotalRow = incomes.length + 2;
        totalSheet.getCell(incTotalRow, 5).value = "Total Ingresos";
        totalSheet.getCell(incTotalRow, 5).font = { bold: true };
        totalSheet.getCell(incTotalRow, 6).value = incomesTotal;
        totalSheet.getCell(incTotalRow, 6).numFmt = "$ #,##0";
        totalSheet.getCell(incTotalRow, 6).font = { bold: true };

        // Bloque de Egresos: columnas H/I
        totalSheet.getCell(1, 8).value = "Egresos";
        totalSheet.getCell(1, 9).value = "Valor";
        totalSheet.getCell(1, 8).font = { bold: true };
        totalSheet.getCell(1, 9).font = { bold: true };
        expenses.forEach((exp, i) => {
          const r = i + 2;
          totalSheet.getCell(r, 8).value = exp.description || new Date(exp.date).toLocaleDateString("es-CO");
          totalSheet.getCell(r, 9).value = exp.amount;
          totalSheet.getCell(r, 9).numFmt = "$ #,##0";
        });
        const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);
        const expTotalRow = expenses.length + 2;
        totalSheet.getCell(expTotalRow, 8).value = "Total Egresos";
        totalSheet.getCell(expTotalRow, 8).font = { bold: true };
        totalSheet.getCell(expTotalRow, 9).value = expensesTotal;
        totalSheet.getCell(expTotalRow, 9).numFmt = "$ #,##0";
        totalSheet.getCell(expTotalRow, 9).font = { bold: true };
      } catch (err) {
        console.error("Error al obtener ingresos/egresos:", err);
      }
    }

    totalSheet.columns.forEach(col => {
      let max = 0;
      if (typeof col.eachCell === "function") col.eachCell({ includeEmpty: true }, cell => { max = Math.max(max, (cell.value?.toString() || "").length); });
      col.width = max + 5;
    });

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

            <ThemeProvider theme={darkPickerTheme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-white/40">Desde</label>
                  <DatePicker
                    value={startDate}
                    onChange={(v) => setStartDate(v)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-white/40">Hasta</label>
                  <DatePicker
                    value={endDate}
                    onChange={(v) => setEndDate(v)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </div>
              </LocalizationProvider>
            </ThemeProvider>

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

            <button
              onClick={handleTodaySearch}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(74,127,255,0.1)',
                color: '#4a7fff',
                border: '1px solid rgba(74,127,255,0.3)',
                height: 40,
              }}
            >
              <CalendarCheck size={14} />
              Hoy
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
            custom: [
              { label: "Ver recibo", icon: <Receipt size={14} className="text-emerald-400" />, action: handleViewReceipt },
              { label: "Editar productos/cantidad/precio", icon: <Pencil size={14} className="text-[#4a7fff]" />, action: handleEditInvoice },
            ],
          }}
        />
      )}

      {/* MODAL DE EDICIÓN */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingInvoice(null)} />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] p-8 shadow-2xl"
            style={{ background: 'rgba(10,17,32,0.98)', border: '1px solid rgba(30,60,139,0.35)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Editar compra
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Elige qué ítem modificar — producto, cantidad y/o precio
                </p>
              </div>
              <button onClick={() => setEditingInvoice(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {editItems.map((it, idx) => (
                <div
                  key={it.saleProductInvoiceId}
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(30,60,139,0.2)' }}
                >
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(74,127,255,0.7)' }}>
                    Ítem {idx + 1}
                  </p>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Producto
                    </label>
                    <div className="mb-2 flex items-center justify-between p-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'rgba(74,127,255,0.08)', border: '1px solid rgba(74,127,255,0.2)' }}>
                      {it.productName}
                    </div>
                    <SearchBarUniversal
                      searchType="products"
                      placeholder="Buscar para cambiar el producto..."
                      showResults={true}
                      onAddToCart={(p) => {
                        const product = p as ProductDAO;
                        updateEditItem(it.saleProductInvoiceId, { productId: product.id, productName: product.name });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Cantidad (kg)
                      </label>
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => updateEditItem(it.saleProductInvoiceId, { quantity: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-black text-white outline-none focus:border-[#1E3C8b] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Precio unitario (COP/kg)
                      </label>
                      <input
                        type="number"
                        value={it.unitPrice}
                        onChange={(e) => updateEditItem(it.saleProductInvoiceId, { unitPrice: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-black text-white outline-none focus:border-[#1E3C8b] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Subtotal</span>
                    <span className="text-sm font-black font-mono text-white">
                      {(Number(it.quantity || 0) * Number(it.unitPrice || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between px-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-[10px] text-slate-400 uppercase font-black">Nuevo total de la factura</span>
                <span className="text-lg font-black font-mono text-white">
                  {editItems
                    .reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0)
                    .toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingInvoice(null)}
                className="flex-1 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditInvoice}
                disabled={isSavingEdit}
                className="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-40"
              >
                {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSavingEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}