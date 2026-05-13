'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import CustomerForm from "./CustomerForm";
import CustomerFormEdit from "./CustomerFormEdit";
import Toolbar from "@/components/organisms/ToolBar";
import EmptyState from '@/components/molecules/EmptyState'; 
import TableFilter from "@/components/molecules/TableFilter";
import CustomTable from "@/components/organisms/CustomTable";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import { getListCustomers, deleteCustomers } from "@/request/users";
import CustomModalNoButton from "@/components/organisms/CustomModalNoButton";
import { 
    ClientDAO, 
    CreatedInvoice, 
    EmployeeDAO, 
    ProductDAO, 
    SupplierDAO 
} from "@/types/Api";

export default function ScreenCustomers() {
    const router = useRouter();
    const t = useTranslations("customers");
    const locale = useLocale();

    const initialFetchDone = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [clients, setClients] = useState<{ [key: string]: string }[]>([]);
    const [currentClient, setCurrentClient] = useState<ClientDAO | null>(null);
    const [initialClients, setInitialClients] = useState<{ [key: string]: string }[]>([]);
    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllClients();
            initialFetchDone.current = true;
        }
    }, []);

    const fetchAllClients = async () => {
        if (isLoading) return; 
        
        setIsLoading(true);
        try {
            const res = await getListCustomers();
            if (res && Array.isArray(res)) {
                const formattedData = formatClients(res);
                setInitialClients(formattedData);
                
                if(currentSort) {
                    const sortedData = sortCustomers(formattedData, currentSort.field, currentSort.direction);
                    setClients(sortedData);
                } else {
                    setClients(formattedData);
                }
            }
        } catch (err) {
            console.error('Error al obtener clientes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // 1. ACTUALIZADO: Mapeo de segundos nombres y apellidos
    const formatClients = (clientList: ClientDAO[]) => {
        return clientList.map((client) => ({
            id: client.id,
            identification: client.identification,
            "first name": client.firstName,
            "middle name": client.middleName || "",
            "last name": client.lastName,
            "second last name": client.secondLastName || "",
            phone: client.phone || "",
            email: client.email || "",
        }));
    };

    const sortCustomers = (data: { [key: string]: string }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleClientsFound = useCallback((results: ProductDAO[] | EmployeeDAO[] | SupplierDAO[] | ClientDAO[] | CreatedInvoice[]) => {
        const clientsResults = results.filter((result): result is ClientDAO => 
            'firstName' in result && 'lastName' in result && 'identification' in result && 'phone' in result
        );
        
        if (clientsResults.length > 0) {
            const formattedData = formatClients(clientsResults);
            
            if (currentSort) {
                const sortedData = sortCustomers(formattedData, currentSort.field, currentSort.direction);
                setClients(sortedData);
            } else {
                setClients(formattedData);
            }
        } else if (searchTerm && searchTerm.length >= 2) {
            setClients([{
                id: "no-results",
                identification: "",
                "first name": "",
                "middle name": "",
                "last name": `No se encontraron clientes para: "${searchTerm}"`,
                "second last name": "",
                phone: "",
                email: "",
            }]);
        } else {
            if (currentSort) {
                const sortedData = sortCustomers([...initialClients], currentSort.field, currentSort.direction);
                setClients(sortedData);
            } else {
                setClients([...initialClients]);
            }
        }
    }, [currentSort, initialClients, searchTerm]);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const sortedClients = sortCustomers([...clients], field, direction);
        setClients(sortedClients);
    }, [clients]);

    // 2. ACTUALIZADO: Manejador de edición con nuevos campos
    const handleEditClient = (clientId: string) => {
        const clientToEdit = initialClients.find(client => client.id === clientId);
        if (clientToEdit) {
            setCurrentClient({
                id: clientToEdit.id,
                tenantId: "", 
                identification: clientToEdit.identification,
                firstName: clientToEdit["first name"],
                middleName: clientToEdit["middle name"], // Agregado
                lastName: clientToEdit["last name"],
                secondLastName: clientToEdit["second last name"], // Agregado
                phone: clientToEdit["phone"],
                email: clientToEdit.email,
            } as ClientDAO);
            setIsModalOpen(true);
        }
    };

    const handleViewClient = (clientId: string) => {
        const clientToView = initialClients.find(client => client.id === clientId);
        if (clientToView) {
            router.push(`/${locale}/users/customers/${clientId}`);
        }
    };

    const handleDeleteClient = (clientId: string) => {
        deleteCustomers(clientId)
            .then(() => {
                fetchAllClients();
            })
            .catch((err) => {
                console.error("Error al eliminar cliente:", err);
             });
    };

    // 3. ACTUALIZADO: Cabeceras de la tabla con los nuevos campos
    const tableHeaders = [
        { label: t("table.id"), key: "id"},
        { label: t("table.identification"), key: "identification"},
        { label: t("table.firstName"), key: "first name"},
        { label: "Segundo Nombre", key: "middle name"},
        { label: t("table.lastName"), key: "last name"},
        { label: "Segundo Apellido", key: "second last name"},
        { label: 'Teléfono', key: "phone"},
        { label: t("table.email"), key: "email"}
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
                    fetchAllClients();
                }} 
                title={t("add")}
            >
                <CustomerForm 
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchAllClients();
                    }} 
                />
            </CustomModalNoButton>
            
            <div className="flex justify-between items-center mb-4 mt-4">
                <div className="w-72">
                    <SearchBarUniversal 
                        onResultsFound={handleClientsFound} 
                        showResults={false}
                        placeholder={t("add")}
                        searchType="clients"
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <TableFilter 
                    headers={tableHeaders} 
                    onSort={handleSort} 
                />
            </div>
            
            {isLoading && (
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(74,127,255,0.6)" }}>{t("loading")}</p>
            )}
            
            {searchTerm && searchTerm.length >= 2 && clients.length === 1 && clients[0].id === "no-results" ? (
                <EmptyState 
                    message={t("noResults")} 
                    searchTerm={searchTerm} 
                />
            ) : (
                <CustomTable
                    title={t("listTitle")}
                    headers={tableHeaders}
                    options={true}
                    data={clients.filter(c => c.id !== "no-results")}
                    contextType="clients"
                    customActions={{
                        edit: handleEditClient,
                        view: handleViewClient,
                        delete: handleDeleteClient,
                    }}
                />
            )}
            
            <CustomModalNoButton 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false); 
                    setTimeout(() => fetchAllClients(), 0);
                }}
                title={t("edit")}
            >
                {/* 4. ACTUALIZADO: Pasando datos completos al formulario de edición */}
                <CustomerFormEdit 
                    client={currentClient ? {
                        id: currentClient.id,
                        identification: currentClient.identification,
                        firstName: currentClient.firstName,
                        middleName: currentClient.middleName || "",
                        lastName: currentClient.lastName,
                        secondLastName: currentClient.secondLastName || "",
                        phone: currentClient.phone || "",
                        email: currentClient.email || ""
                    } : undefined}
                    onSuccess={() => {
                        fetchAllClients();
                        setIsModalOpen(false);
                    }} 
                />
            </CustomModalNoButton>
        </div>
    );
}