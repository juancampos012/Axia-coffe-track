'use client';

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import Toolbar from "@/components/organisms/ToolBar";
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
            console.log("Fetched invoices:", start, end, res);

            if (res && Array.isArray(res)) {
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

    return (
        <div className="container mx-auto">
            <Toolbar title={t("title")} invoice={true} />

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
