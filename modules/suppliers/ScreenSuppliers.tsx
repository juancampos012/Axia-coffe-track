'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import CustomModalNoButton from "@/components/organisms/CustomModalNoButton";
import { getListSuppliers, deleteSupplier } from "@/lib/api-suppliers";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import CustomTable from "@/components/organisms/CustomTable";
import TableFilter from "@/components/molecules/TableFilter";
import EmptyState from '@/components/molecules/EmptyState';
import SupplierDetail from "./SupplierDetail/SupplierDetail";
import Toolbar from "@/components/organisms/ToolBar";
import SupplierFormEdit from "./SupplierFormEdit";
import { SupplierDAO } from "@/types/Api";
import SupplierForm from "./SupplierForm";

// Nuevo estado para controlar la visibilidad del chatbot
export default function ScreenSuppliers() {
    const router = useRouter();
    const t = useTranslations("supplier");
    
    const initialFetchDone = useRef(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [suppliers, setSuppliers] = useState<{ [key: string]: string }[]>([]);
    const [currentSupplier, setCurrentSupplier] = useState<SupplierDAO | null>(null);
    const [initialSuppliers, setInitialSuppliers] = useState<{ [key: string]: string }[]>([]);
    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);


    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllSuppliers();
            initialFetchDone.current = true;
        }
    }, []);

    const fetchAllSuppliers = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const res = await getListSuppliers();
            if (res && Array.isArray(res)) {
                const formattedData = formatSuppliers(res);
                setInitialSuppliers(formattedData);
                
                if(currentSort) {
                    const sortedData = sortSuppliers(formattedData, currentSort.field, currentSort.direction);
                    setSuppliers(sortedData);
                } else {
                    setSuppliers(formattedData);
                }
            }
        } catch (err) {
            console.log('Error al obtener proveedores', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatSuppliers = (supplierList: SupplierDAO[]) => {
        return supplierList.map((supplier) => ({
            id: supplier.id,
            nit: supplier.nit,
            name: supplier.name,
            phone: supplier.phone,
            address: supplier.address,
        }));
    };

    const sortSuppliers = (data: { [key: string]: string }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSuppliersFound = useCallback((results: any[]) => {
        const suppliersResults = results.filter((result): result is SupplierDAO => 
            'nit' in result && 'name' in result
        );
        
        if (suppliersResults.length > 0) {
            const formattedData = formatSuppliers(suppliersResults);
            
            if (currentSort) {
                const sortedData = sortSuppliers(formattedData, currentSort.field, currentSort.direction);
                setSuppliers(sortedData);
            } else {
                setSuppliers(formattedData);
            }
        } else if (searchTerm && searchTerm.length >= 2) {
            setSuppliers([{
                id: "no-results",
                nit: "",
                name: t("notFoundFor", { term: searchTerm }),
                phone: "",
                address: "",
            }]);
        } else {
            if (currentSort) {
                const sortedData = sortSuppliers([...initialSuppliers], currentSort.field, currentSort.direction);
                setSuppliers(sortedData);
            } else {
                setSuppliers([...initialSuppliers]);
            }
        }
    }, [currentSort, initialSuppliers, searchTerm]);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const sortedSuppliers = sortSuppliers([...suppliers], field, direction);
        setSuppliers(sortedSuppliers);
    }, [suppliers]);

    const handleEditSupplier = (supplierId: string) => {
        const supplierToEdit = initialSuppliers.find(supplier => supplier.id === supplierId);
        if (supplierToEdit) {
            setCurrentSupplier({
                id: supplierToEdit.id,
                tenantId: "", 
                nit: supplierToEdit.nit,
                name: supplierToEdit.name,
                phone: supplierToEdit.phone,
                address: supplierToEdit.address,
            });
            setIsEditModalOpen(true);
        }
    };

    const handleViewSupplier = (supplierId: string) => {
        const supplierToView = suppliers.find(emp => emp.id === supplierId);
        if (supplierToView) {
            setCurrentSupplier({
                id: supplierToView.id,
                name: supplierToView.name,
                phone: supplierToView.phone,
                address: supplierToView.address,
                nit: supplierToView.nit,
                tenantId: "", 
            });
            //router.push(`/users/employees/${employeeId}`);
            setIsViewModalOpen(true);
        }
    };

    const handleDeleteSupplier = async (supplierId: string) => {
            try {
                await deleteSupplier(supplierId);
                fetchAllSuppliers();
            } catch (err) {
                console.error("Error al eliminar proveedor:", err);
                alert(t("deleteError"));
            }
    };

    const tableHeaders = [
        { label: t("id"), key: "id"},
        { label: t("nit"), key: "nit"},
        { label: t("name"), key: "name"},
        { label: t("phone"), key: "phone"},
        { label: t("address"), key: "address"}
    ];

    return (
        <div className="container mx-auto">
            <Toolbar
                title={t("title")}
                onAddNew={() => setIsAddModalOpen(true)}
            />
            
            <CustomModalNoButton 
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    fetchAllSuppliers();
                }}
                title={t("new")}
            >
                <SupplierForm 
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchAllSuppliers();
                    }} 
                />
            </CustomModalNoButton>
            
            <div className="flex justify-between items-center mb-4 mt-4">
                <div className="w-72">
                    <SearchBarUniversal 
                        onResultsFound={handleSuppliersFound} 
                        showResults={false}
                        placeholder={t("searchPlaceholder")}
                        searchType="suppliers"
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <TableFilter 
                    headers={tableHeaders}
                    onSort={handleSort} 
                />
            </div>
            
            {isLoading && <p className="text-gray-500 text-sm mb-2">{t("loading")}</p>}
            
            {searchTerm && searchTerm.length >= 2 && suppliers.length === 1 && suppliers[0].id === "no-results" ? (
                <EmptyState 
                    message={t("noResults")} 
                    searchTerm={searchTerm} 
                />
            ) : (
                <CustomTable
                    title={t("list")}
                    headers={tableHeaders}
                    options={true}
                    data={suppliers.filter(s => s.id !== "no-results")}
                    contextType="suppliers"
                    customActions={{
                        edit: handleEditSupplier,
                        view: handleViewSupplier,
                        delete: handleDeleteSupplier,
                    }}
                />
            )}
            
            <CustomModalNoButton 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false); 
                    setTimeout(() => fetchAllSuppliers(), 0);
                }}
                title={t("edit")}
            >
                <SupplierFormEdit 
                    supplier={currentSupplier || undefined}
                    onSuccess={() => {
                        fetchAllSuppliers();
                        setIsEditModalOpen(false);
                    }} 
                />
            </CustomModalNoButton>

            <SupplierDetail
                supplier={currentSupplier}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
        </div>
    );
}
