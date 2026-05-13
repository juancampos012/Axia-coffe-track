'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import ProductForm from "./ProductForm";
import ProductFormEdit from "./productFormEdit";
import Toolbar from "@/components/organisms/ToolBar";
import { getListproducts } from "@/lib/api-products";
import { deleteProduct } from "@/lib/api-products-status";
import EmptyState from '@/components/molecules/EmptyState';
import CustomTable from "@/components/organisms/CustomTable";
import TableFilter from "@/components/molecules/TableFilter";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import ProductDetailModal from "./ProductDetail/ProductDetailModal";
import CustomModalNoButton from "@/components/organisms/CustomModalNoButton";
import { 
    ClientDAO, 
    CreatedInvoice, 
    EmployeeDAO, 
    ProductDAO, 
    ProductFormProps, 
    SupplierDAO 
} from "@/types/Api";

export default function ScreenProducts({ onSuccess }: ProductFormProps) {
    const router = useRouter();
    const t = useTranslations("products");

    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
    const [initialProducts, setInitialProducts] = useState<{ [key: string]: string }[]>([]);
    const [currentProduct, setCurrentProduct] = useState<ProductDAO | null>(null);
    const [products, setProducts] = useState<{ [key: string]: string }[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const initialFetchDone = useRef(false);
    
    // Mapeo simplificado para ordenamiento
    const fieldMapping: { [key: string]: string } = {
        'código': 'id',
        'producto': 'name'
    };

    // 1. SOLUCIÓN AL WARNING: fetchAllProducts con useCallback
    const fetchAllProducts = useCallback(async (sortParams?: { sortBy: string, order: 'asc' | 'desc' }) => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const res = await getListproducts(sortParams);
            if (res && Array.isArray(res)) {
                // Formateamos para que el estado solo tenga lo que queremos mostrar
                const formatted = res.map((product: ProductDAO) => ({
                    id: product.id,
                    código: product.id,
                    producto: product.name,
                }));
                setInitialProducts(formatted);
                setProducts(formatted);
            }
        } catch (err) {
            console.error('Error al obtener productos:', err);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]); // Dependencia necesaria

    // 2. SOLUCIÓN AL EFFECT: fetchAllProducts ya es estable
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllProducts();
            initialFetchDone.current = true;
        }
    }, [fetchAllProducts]);

    const handleProductsFound = (results: any[]) => {
        const productResults = results.filter((result): result is ProductDAO => 
            'name' in result && 'id' in result
        );
        
        if (productResults.length > 0) {
            const formatted = productResults.map(p => ({
                id: p.id,
                código: p.id,
                producto: p.name
            }));
            setProducts(formatted);
        } else if (searchTerm && searchTerm.length >= 2) {
            setProducts([{
                id: "no-results",
                código: "",
                producto: t("productNotFound", { term: searchTerm }),
            }]);
        } else {
            setProducts(initialProducts);
        }
    };

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        if (fieldMapping[field]) {
            fetchAllProducts({ sortBy: fieldMapping[field], order: direction });
        }
    };

    const handleRowClick = (productId: string) => {
        // Buscamos en la lista local el producto para mostrar el modal
        const productData = products.find(p => p.id === productId);
        if (productData) {
            setCurrentProduct({
                id: productData.id,
                name: productData.producto,
                tenantId: "",
                // Nota: campos como stock/precio vendrán vacíos si no haces un fetchById aquí
            } as ProductDAO);
            setIsViewModalOpen(true);
        }
    };

    const handleEditProduct = (productId: string) => {
        const productToEdit = products.find(p => p.id === productId);
        if (productToEdit) {
            setCurrentProduct({
                id: productToEdit.id,
                name: productToEdit.producto,
                tenantId: "",
            } as ProductDAO);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (confirm(t("confirmDelete"))) {
            try {
                await deleteProduct(productId);
                fetchAllProducts();
            } catch (err) {
                console.error("Error al eliminar producto:", err);
            }
        }
    };

    // 3. CABECERAS ESTRICTAS: Solo Código y Producto
    const tableHeaders = [
        { label: t("headers.code"), key: "código"},
        { label: t("headers.product"), key: "producto"}
    ];

    return (
        <div className="container mx-auto">
            <Toolbar title={t("title")} onAddNew={() => setIsAddModalOpen(true)} />

            {/* Modal para Agregar */}
            <CustomModalNoButton 
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    fetchAllProducts();
                }}
                title={t("newProduct")}
            >
                <ProductForm onSuccess={() => { setIsAddModalOpen(false); fetchAllProducts(); }} />
            </CustomModalNoButton>
            
            <div className="flex justify-between items-center mb-4 mt-4">
                <div className="w-72">
                    <SearchBarUniversal 
                        onResultsFound={handleProductsFound} 
                        showResults={false}
                        placeholder={t("searchPlaceholder")}
                        searchType="products"
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <TableFilter headers={tableHeaders} onSort={handleSort} />
            </div>
            
            {isLoading && (
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(74,127,255,0.6)" }}>{t("loading")}</p>
            )}
            
            {searchTerm && searchTerm.length >= 2 && products.length === 1 && products[0].id === "no-results" ? (
                <EmptyState message={t("noResults")} searchTerm={searchTerm} />
            ) : (
                <CustomTable
                    title={t("tableTitle")}
                    headers={tableHeaders}
                    options={true}
                    // Filtramos los datos para que NADA extra llegue a la tabla
                    data={products.filter(p => p.id !== "no-results")}
                    contextType="products"
                    onRowDoubleClick={(item) => handleRowClick(item.id)} 
                    customActions={{
                        delete: handleDeleteProduct,
                        edit: handleEditProduct,
                        view: (id) => handleRowClick(id)
                    }}
                />
            )}

            {/* Modal para Editar */}
            <CustomModalNoButton 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                title={t("edit")}
            >
                <ProductFormEdit 
                    product={currentProduct || undefined}
                    onSuccess={() => { fetchAllProducts(); setIsEditModalOpen(false); }} 
                />
            </CustomModalNoButton>
                
            {/* Modal de Detalle */}
            <ProductDetailModal
                product={currentProduct}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
        </div>
    );
}