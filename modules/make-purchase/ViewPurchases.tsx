"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Loader2 } from "lucide-react";

import Toolbar from "@/components/organisms/ToolBar";
import EmptyState from '@/components/molecules/EmptyState';
import CustomTable from "@/components/organisms/CustomTable";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import TableFilter from "@/components/molecules/TableFilter";
import { getListDeposit, deleteDeposit } from "@/request/deposit";
import { useBalance } from "@/context/BalanceContext";

export default function ViewPurchases() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("purchases");
    const { balance, setBalance } = useBalance();

    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [invoices, setInvoices] = useState<{ [key: string]: string }[]>([]);
    const [initialInvoices, setInitialInvoices] = useState<{ [key: string]: string }[]>([]);
    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);

    const initialFetchDone = useRef(false);

    const tableHeaders = [
        { label: t("headers.id"), key: "id"},
        { label: t("headers.supplier"), key: "proveedor"},
        { label: t("headers.date"), key: "fecha"},
        { label: t("headers.total"), key: "total"},
    ];

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllInvoices();
            initialFetchDone.current = true;
        }
    }, []);

    const fetchAllInvoices = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const res = await getListDeposit();
            if (res && Array.isArray(res)) {
                const formatted = formatInvoices(res);
                setInitialInvoices(formatted);
                setInvoices(formatted);
            }
        } catch (error) {
            console.error("Error fetching invoices", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatInvoices = (invoiceList: any[]) => {
        return invoiceList.map((invoice) => {
            // 1. Solución al error de TS: Usamos supplierId ya que supplier no existe
            // 2. Solución al error de toFixed: Convertimos amount a Number
            const amountNum = Number(invoice.amount) || 0;

            return {
                id: invoice.id,
                proveedor: invoice.supplierId || "S/N", // Aquí usamos el campo que sí existe
                fecha: new Date(invoice.createdAt).toLocaleDateString(),
                total: new Intl.NumberFormat('es-CO', { 
                    style: 'currency', 
                    currency: 'COP', 
                    maximumFractionDigits: 0 
                }).format(amountNum),
            };
        });
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
        setInvoices(prev => sortInvoices([...prev], field, direction));
    }, []);

    const handleDeleteInvoice = async (invoiceId: string) => {
        if (!confirm("¿Deseas eliminar este registro?")) return;
        try {
            const invoice = invoices.find((inv) => inv.id === invoiceId);
            const amount = invoice ? parseFloat(invoice.total.replace(/[^0-9]/g,"")) : 0;
            
            await deleteDeposit(invoiceId);
            if (balance !== null) setBalance(balance - amount);
            
            fetchAllInvoices();
        } catch (error) {
            alert(t("deleteError"));
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#0a1120] p-6 text-slate-200">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* TOOLBAR */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
                    <Toolbar title={t("title")} invoice={true} />
                </div>

                {/* FILTROS Y BÚSQUEDA */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-96">
                        <SearchBarUniversal 
                            onResultsFound={() => {}} 
                            placeholder={t("searchPlaceholder")}
                            searchType="suppliers"
                            showResults={false}
                            onSearchTermChange={setSearchTerm}
                        />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-1 h-14 flex items-center">
                        <TableFilter headers={tableHeaders} onSort={handleSort} />
                    </div>
                </div>

                {/* CONTENEDOR DE TABLA */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative min-h-[450px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-[#0a1120]/60 backdrop-blur-sm z-30 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500" size={40} />
                        </div>
                    )}

                    <div className="p-4">
                        {searchTerm && invoices.length === 0 ? (
                            <EmptyState message={t("empty")} searchTerm={searchTerm} />
                        ) : (
                            <CustomTable
                                title={t("tableTitle")}
                                headers={tableHeaders}
                                options={true}
                                data={invoices}
                                contextType="purchase"
                                customActions={{
                                    view: (id) => router.push(`/${locale}/shopping/view-purchases/${id}`),
                                    delete: handleDeleteInvoice,
                                    edit: (id) => router.push(`/${locale}/shopping/edit-purchase/${id}`)
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .container { max-width: 100% !important; }
                input { 
                    background: rgba(255,255,255,0.03) !important; 
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    color: white !important;
                    border-radius: 1.25rem !important;
                    height: 3.5rem !important;
                    padding-left: 1rem !important;
                }
            `}</style>
        </div>
    );
}