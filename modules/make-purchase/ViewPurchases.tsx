"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import Toolbar from "@/components/organisms/ToolBar";
import EmptyState from '@/components/molecules/EmptyState';
import CustomTable from "@/components/organisms/CustomTable";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import TableFilter from "@/components/molecules/TableFilter";
import { getListSalePurchases } from "@/lib/api-purchase";
import { SupplierDAO } from "@/types/Api";
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

                if (currentSort) {
                    const sorted = sortInvoices(formatted, currentSort.field, currentSort.direction);
                    setInvoices(sorted);
                } else {
                    setInvoices(formatted);
                }
            }
        } catch (error) {
            console.error("Error fetching invoices", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatInvoices = (invoiceList: any[]) => {
        return invoiceList.map((invoice) => ({
            id: invoice.id,
            proveedor: `${invoice.supplier?.name || "Nombre"}`,
            fecha: new Date(invoice.createdAt).toLocaleDateString(),
            total: `$${(invoice.amount || 0).toFixed(2)}`,
        }));
    };

    const sortInvoices = (data: { [key: string]: string }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleInvoicesFound = useCallback(async (results: any[]) => {
        const suppliersWithPurchases = await Promise.all(
            results.map(async (supplier: SupplierDAO) => {
                const allPurchases = await getListSalePurchases(); 
                const purchases = allPurchases.filter(p => p.supplier?.id === supplier.id);
                return purchases.length > 0 ? purchases : null;
            })
        );

        const filtered = suppliersWithPurchases.flat().filter(Boolean);

        if (filtered.length > 0) {
            const formatted = formatInvoices(filtered);
            if (currentSort) {
                const sorted = sortInvoices(formatted, currentSort.field, currentSort.direction);
                setInvoices(sorted);
            } else {
                setInvoices(formatted);
            }
        } else {
            if (searchTerm && searchTerm.length >= 2) {
                setInvoices([{
                    id: "no-results",
                    proveedor: `No se encontraron compras del proveedor: "${searchTerm}"`,
                    fecha: "",
                    total: "",
                }]);
            } else {
                const sorted = currentSort
                    ? sortInvoices([...initialInvoices], currentSort.field, currentSort.direction)
                    : [...initialInvoices];
                setInvoices(sorted);
            }
        }
    }, [currentSort, searchTerm, initialInvoices]);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const sorted = sortInvoices([...invoices], field, direction);
        setInvoices(sorted);
    }, [invoices]);

    const handleViewInvoice = (invoiceId: string) => {
        router.push(`/${locale}/shopping/view-purchases/${invoiceId}`);
    };

    const handleDeleteInvoice = async (invoiceId: string) => {
        try {
            const invoice = invoices.find((inv) => inv.id === invoiceId);
            const amount = invoice ? parseFloat(invoice.total.replace(/[^0-9.-]+/g,"")) : 0;

            await deleteDeposit(invoiceId);

            if (balance !== null && !isNaN(amount)) {
                setBalance(balance - amount);
            }

            fetchAllInvoices();
        } catch (error) {
            console.error("Error eliminando la factura:", error);
            alert(t("deleteError"));
        }
    };

    return (
        <div className="container mx-auto">
            <Toolbar
                title={t("title")}
                invoice={true}
            />

            <div className="flex justify-between items-center mb-4 mt-4">
                <div className="w-72">
                    <SearchBarUniversal 
                        onResultsFound={handleInvoicesFound}
                        placeholder={t("searchPlaceholder")}
                        searchType="suppliers"
                        showResults={false}
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <TableFilter
                    headers={tableHeaders}
                    onSort={handleSort}
                />
            </div>

            {isLoading && <p className="text-gray-500 text-sm mb-2">{t("loading")}</p>}

            {searchTerm && searchTerm.length >= 2 && invoices.length === 1 && invoices[0].id === "no-results" ? (
                <EmptyState
                    message={t("empty")} 
                    searchTerm={searchTerm}
                />
            ) : (
                <CustomTable
                    title={t("tableTitle")}
                    headers={tableHeaders}
                    options={true}
                    data={invoices.filter(i => i.id !== "no-results")}
                    contextType="purchase"
                    customActions={{
                        view: handleViewInvoice,
                        delete: handleDeleteInvoice,
                        edit: (invoiceId: string) => {
                            router.push(`/${locale}/shopping/edit-purchase/${invoiceId}`);
                        }
                    }}
                />
            )}
        </div>
    );
}
