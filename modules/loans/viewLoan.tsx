"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import Toolbar from "@/components/organisms/ToolBar";
import EmptyState from '@/components/molecules/EmptyState';
import CustomTable from "@/components/organisms/CustomTable";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import TableFilter from "@/components/molecules/TableFilter";
import { getListLoans, deleteLoan, updateLoanStatus, getLoansByClient } from "@/request/loans";
import { ClientDAO } from "@/types/Api";
import { useBalance } from "@/context/BalanceContext"; // Importar el contexto

export default function ViewLoans() {
    const router = useRouter();
    const locale = useLocale();
    const { balance, setBalance } = useBalance(); // Obtener balance del contexto

    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loans, setLoans] = useState<{ [key: string]: any }[]>([]);
    const [initialLoans, setInitialLoans] = useState<{ [key: string]: any }[]>([]);
    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const initialFetchDone = useRef(false);

    const tableHeaders = [
        { label: "ID", key: "id", sortable: true },
        { label: "Cliente", key: "cliente", sortable: true },
        { label: "Monto", key: "monto", sortable: true },
        { label: "Fecha", key: "fecha", sortable: true },
        { label: "Estado", key: "estado", sortable: true },
        { label: "Descripción", key: "descripcion", sortable: false },
    ];

    const statusOptions = [
        { value: "all", label: "Todos" },
        { value: "pending", label: "Pendiente" },
        { value: "paid", label: "Pagado" },
    ];

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllLoans();
            initialFetchDone.current = true;
        }
    }, []);

    useEffect(() => {
        if (statusFilter && statusFilter !== "all") {
            fetchLoansByStatus(statusFilter === "pending" ? false : true);
        } else {
            fetchAllLoans();
        }
    }, [statusFilter]);

    const fetchAllLoans = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const res = await getListLoans();
            if (res && Array.isArray(res)) {
                const formatted = formatLoans(res);
                setInitialLoans(formatted);

                if (currentSort) {
                    const sorted = sortLoans(formatted, currentSort.field, currentSort.direction);
                    setLoans(sorted);
                } else {
                    setLoans(formatted);
                }
            }
        } catch (error) {
            console.error("Error cargando préstamos", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLoansByStatus = async (status: boolean) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const res = await getListLoans(status);
            if (res && Array.isArray(res)) {
                const formatted = formatLoans(res);
                setInitialLoans(formatted);

                if (currentSort) {
                    const sorted = sortLoans(formatted, currentSort.field, currentSort.direction);
                    setLoans(sorted);
                } else {
                    setLoans(formatted);
                }
            }
        } catch (error) {
            console.error("Error cargando préstamos por estado", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatLoans = (loanList: any[]) => {
        return loanList.map((loan) => ({
            id: loan.id,
            cliente: `${loan.client?.firstName || loan.clientName || ""} ${loan.client?.lastName || ""}`.trim() || "Cliente no disponible",
            clienteId: loan.clientId,
            monto: loan.amount ? `$${loan.amount.toLocaleString('es-CO')}` : "$0",
            fecha: new Date(loan.createdAt).toLocaleDateString('es-CO'),
            estado: loan.status ? "Pagado" : "Pendiente",
            descripcion: loan.description || "Sin descripción",
            rawAmount: loan.amount || 0,
            rawStatus: loan.status || false,
            rawDate: loan.createdAt,
            clientIdentification: loan.client?.identification || loan.clientIdentification || "N/A",
        }));
    };

    const sortLoans = (data: { [key: string]: any }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            // Manejar ordenamiento por campos numéricos
            if (field === 'monto') {
                return direction === 'asc' 
                    ? (a.rawAmount || 0) - (b.rawAmount || 0)
                    : (b.rawAmount || 0) - (a.rawAmount || 0);
            }
            
            // Manejar ordenamiento por fecha
            if (field === 'fecha') {
                const dateA = new Date(a.rawDate).getTime();
                const dateB = new Date(b.rawDate).getTime();
                return direction === 'asc' ? dateA - dateB : dateB - dateA;
            }
            
            // Manejar ordenamiento por estado (pendiente primero, luego pagado)
            if (field === 'estado') {
                const statusA = a.rawStatus ? 1 : 0; // pagado = 1, pendiente = 0
                const statusB = b.rawStatus ? 1 : 0;
                return direction === 'asc' ? statusA - statusB : statusB - statusA;
            }
            
            // Ordenamiento por texto para otros campos
            const valueA = String(a[field] || '').toLowerCase();
            const valueB = String(b[field] || '').toLowerCase();
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleLoansFound = useCallback(async (results: any[]) => {
        setIsLoading(true);
        try {
            const filteredLoans: any[] = [];
            
            // Para cada cliente encontrado, buscar sus préstamos
            for (const client of results as ClientDAO[]) {
                try {
                    const clientLoans = await getLoansByClient(client.id);
                    if (clientLoans && clientLoans.length > 0) {
                        filteredLoans.push(...clientLoans);
                    }
                } catch (error) {
                    console.error(`Error buscando préstamos para cliente ${client.id}:`, error);
                }
            }

            if (filteredLoans.length > 0) {
                const formatted = formatLoans(filteredLoans);
                if (currentSort) {
                    const sorted = sortLoans(formatted, currentSort.field, currentSort.direction);
                    setLoans(sorted);
                } else {
                    setLoans(formatted);
                }
            } else {
                if (searchTerm && searchTerm.length >= 2) {
                    setLoans([{
                        id: "no-results",
                        cliente: `No se encontraron préstamos para: "${searchTerm}"`,
                        monto: "",
                        fecha: "",
                        estado: "",
                        descripcion: "",
                    }]);
                } else {
                    const sorted = currentSort
                        ? sortLoans([...initialLoans], currentSort.field, currentSort.direction)
                        : [...initialLoans];
                    setLoans(sorted);
                }
            }
        } catch (error) {
            console.error("Error en búsqueda de préstamos:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentSort, searchTerm, initialLoans]);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const sorted = sortLoans([...loans], field, direction);
        setLoans(sorted);
    }, [loans]);

    const handleViewLoan = (loanId: string) => {
        router.push(`/${locale}/loans/view/${loanId}`);
    };

    const handleDeleteLoan = async (loanId: string) => {
        if (!confirm("¿Estás seguro de eliminar este préstamo?")) return;
        
        try {
            await deleteLoan(loanId);
            alert("Préstamo eliminado correctamente");
            
            // Recargar la lista filtrada si hay filtro activo
            if (statusFilter && statusFilter !== "all") {
                fetchLoansByStatus(statusFilter === "pending" ? false : true);
            } else {
                fetchAllLoans();
            }
        } catch (error) {
            console.error("Error eliminando el préstamo:", error);
            alert("Error al eliminar el préstamo");
        }
    };

    const handleEditLoan = (loanId: string) => {
        router.push(`/${locale}/loans/edit/${loanId}`);
    };

    const handleMarkAsPaid = async (loanId: string) => {
        if (!confirm("¿Marcar este préstamo como pagado?")) return;
        
        try {
            // Encontrar el préstamo antes de actualizarlo
            const loanToUpdate = loans.find(loan => loan.id === loanId);
            if (!loanToUpdate) {
                alert("No se encontró el préstamo");
                return;
            }

            const amount = loanToUpdate.rawAmount || 0;
            
            // Actualizar el estado del préstamo en el servidor
            await updateLoanStatus(loanId, true);
            
            // Actualizar el balance cuando se marca como PAGADO (dinero vuelve a la caja)
            if (balance !== null && amount > 0) {
                setBalance(balance + amount);
            }
            
            // Actualizar el estado en la lista local
            setLoans(prevLoans => 
                prevLoans.map(loan => 
                    loan.id === loanId 
                        ? { 
                            ...loan, 
                            estado: "Pagado",
                            rawStatus: true 
                          }
                        : loan
                )
            );
        } catch (error) {
            console.error("Error actualizando el estado:", error);
            alert("Error al marcar como pagado");
        }
    };

    const handleMarkAsPending = async (loanId: string) => {
        if (!confirm("¿Marcar este préstamo como pendiente?")) return;
        
        try {
            // Encontrar el préstamo antes de actualizarlo
            const loanToUpdate = loans.find(loan => loan.id === loanId);
            if (!loanToUpdate) {
                alert("No se encontró el préstamo");
                return;
            }

            const amount = loanToUpdate.rawAmount || 0;
            
            // Actualizar el estado del préstamo en el servidor
            await updateLoanStatus(loanId, false);
            
            // Actualizar el balance cuando se marca como PENDIENTE (dinero sale de la caja)
            if (balance !== null && amount > 0) {
                setBalance(balance - amount);
            }
            
            alert("Préstamo marcado como pendiente");
            
            // Actualizar el estado en la lista local
            setLoans(prevLoans => 
                prevLoans.map(loan => 
                    loan.id === loanId 
                        ? { 
                            ...loan, 
                            estado: "Pendiente",
                            rawStatus: false 
                          }
                        : loan
                )
            );
        } catch (error) {
            console.error("Error actualizando el estado:", error);
            alert("Error al marcar como pendiente");
        }
    };

    // Función para obtener el monto total de préstamos pendientes
    const calculateTotalPending = useCallback(() => {
        return loans
            .filter(loan => !loan.rawStatus && loan.id !== "no-results")
            .reduce((total, loan) => total + (loan.rawAmount || 0), 0);
    }, [loans]);

    // Función para obtener el monto total de préstamos pagados
    const calculateTotalPaid = useCallback(() => {
        return loans
            .filter(loan => loan.rawStatus && loan.id !== "no-results")
            .reduce((total, loan) => total + (loan.rawAmount || 0), 0);
    }, [loans]);

    return (
        <div className="container mx-auto">
            <Toolbar
                title="Préstamos"
                invoice={true}
            />

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-400 mb-1">Préstamos Pendientes</h3>
                    <p className="text-2xl font-bold text-yellow-300">
                        ${calculateTotalPending().toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-yellow-500 mt-1">
                        {loans.filter(loan => !loan.rawStatus && loan.id !== "no-results").length} préstamos
                    </p>
                </div>
                
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-400 mb-1">Préstamos Pagados</h3>
                    <p className="text-2xl font-bold text-green-300">
                        ${calculateTotalPaid().toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                        {loans.filter(loan => loan.rawStatus && loan.id !== "no-results").length} préstamos
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 mt-4">
                <div className="flex items-center gap-4">
                    <div className="w-72">
                        <SearchBarUniversal 
                            onResultsFound={handleLoansFound}
                            placeholder="Buscar por nombre o cédula del cliente..."
                            searchType="clients"
                            showResults={false}
                            onSearchTermChange={setSearchTerm}
                        />
                    </div>
                    
                    {/* Filtro por estado */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Filtrar por:</span>
                        <select
                            value={statusFilter || "all"}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <TableFilter
                    headers={tableHeaders}
                    onSort={handleSort}
                />
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Cargando préstamos...</span>
                </div>
            )}

            {!isLoading && searchTerm && searchTerm.length >= 2 && loans.length === 1 && loans[0].id === "no-results" ? (
                <EmptyState
                    message="No se encontraron préstamos" 
                    searchTerm={searchTerm}
                />
            ) : (
                !isLoading && (
                    <CustomTable
                        title="Lista de Préstamos"
                        headers={tableHeaders}
                        options={true}
                        data={loans.filter(i => i.id !== "no-results")}
                        contextType="loan"
                        customActions={{
                            view: handleViewLoan,
                            delete: handleDeleteLoan,
                            edit: handleEditLoan,
                            custom: [
                                {
                                    label: "Marcar como Pagado",
                                    action: handleMarkAsPaid,
                                    icon: "💰",
                                    color: "green",
                                    showCondition: (loan) => loan.rawStatus === false
                                },
                                {
                                    label: "Marcar como Pendiente",
                                    action: handleMarkAsPending,
                                    icon: "⏳",
                                    color: "yellow",
                                    showCondition: (loan) => loan.rawStatus === true
                                }
                            ]
                        }}
                        statusColumn={{
                            key: "estado",
                            statusMap: {
                                "Pendiente": "yellow",
                                "Pagado": "green",
                            }
                        }}
                        showDetails={(loan) => (
                            <div className="text-xs text-gray-400 mt-1">
                                <p>Cédula: {loan.clientIdentification}</p>
                                <p>Fecha creación: {new Date(loan.rawDate).toLocaleString('es-CO')}</p>
                                <p>Monto: ${loan.rawAmount.toLocaleString('es-CO')}</p>
                                <p className="mt-2">
                                    Estado: 
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${loan.rawStatus ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                        {loan.rawStatus ? "Pagado" : "Pendiente"}
                                    </span>
                                </p>
                            </div>
                        )}
                    />
                )
            )}
        </div>
    );
}