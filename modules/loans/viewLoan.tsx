'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Clock, 
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";

import Toolbar from "@/components/organisms/ToolBar";
import CustomTable from "@/components/organisms/CustomTable";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import TableFilter from "@/components/molecules/TableFilter";
import { getListLoans, deleteLoan, updateLoanStatus, getLoansByClient } from "@/request/loans";
import { ClientDAO } from "@/types/Api";
import { useBalance } from "@/context/BalanceContext";

export default function ViewLoans() {
    const router = useRouter();
    const locale = useLocale();
    const { balance, setBalance } = useBalance(); // Quitamos isVisible y toggleVisibility de aquí
    const [isLocalVisible, setIsLocalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loans, setLoans] = useState<{ [key: string]: any }[]>([]);
    const [initialLoans, setInitialLoans] = useState<{ [key: string]: any }[]>([]);
    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const initialFetchDone = useRef(false);

    // Helper para formatear con puntos y respetar la privacidad
    const formatPrivacyCurrency = (amount: number): string => {
        if (!isLocalVisible) return "••••••";
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace(/\u00A0/g, ' '); 
    };

    const tableHeaders = [
        { label: "ID", key: "id", sortable: true },
        { label: "Cliente", key: "cliente", sortable: true },
        { label: "Monto", key: "monto", sortable: true },
        { label: "Fecha", key: "fecha", sortable: true },
        { label: "Estado", key: "estado", sortable: true },
        { label: "Descripción", key: "descripcion", sortable: false },
    ];

    const statusOptions = [
        { value: "all", label: "Todos los Registros" },
        { value: "pending", label: "Pendientes" },
        { value: "paid", label: "Pagados" },
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
                setLoans(currentSort ? sortLoans(formatted, currentSort.field, currentSort.direction) : formatted);
            }
        } catch (error) {
            console.error("Error cargando préstamos", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLoansByStatus = async (status: boolean) => {
        setIsLoading(true);
        try {
            const res = await getListLoans(status);
            if (res && Array.isArray(res)) {
                const formatted = formatLoans(res);
                setLoans(currentSort ? sortLoans(formatted, currentSort.field, currentSort.direction) : formatted);
            }
        } catch (error) {
            console.error("Error por estado", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatLoans = (loanList: any[]) => {
        return loanList.map((loan) => ({
            id: loan.id,
            cliente: `${loan.client?.firstName || ""} ${loan.client?.lastName || ""}`.trim() || "Cliente Desconocido",
            clienteId: loan.clientId,
            monto: formatPrivacyCurrency(loan.amount || 0),
            fecha: new Date(loan.createdAt).toLocaleDateString('es-CO'),
            estado: loan.status ? "Pagado" : "Pendiente",
            descripcion: loan.description || "Sin notas",
            rawAmount: loan.amount || 0,
            rawStatus: loan.status || false,
            rawDate: loan.createdAt,
            clientIdentification: loan.client?.identification || "N/A",
        }));
    };

    const sortLoans = (data: { [key: string]: any }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            if (field === 'monto') return direction === 'asc' ? a.rawAmount - b.rawAmount : b.rawAmount - a.rawAmount;
            if (field === 'fecha') return direction === 'asc' ? new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime() : new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
            const valueA = String(a[field] || '').toLowerCase();
            const valueB = String(b[field] || '').toLowerCase();
            return direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
    };

    const handleLoansFound = useCallback(async (results: any[]) => {
        setIsLoading(true);
        try {
            const filteredLoans: any[] = [];
            for (const client of results as ClientDAO[]) {
                const clientLoans = await getLoansByClient(client.id);
                if (clientLoans) filteredLoans.push(...clientLoans);
            }
            if (filteredLoans.length > 0) {
                const formatted = formatLoans(filteredLoans);
                setLoans(currentSort ? sortLoans(formatted, currentSort.field, currentSort.direction) : formatted);
            } else if (searchTerm.length >= 2) {
                setLoans([{ id: "no-results" }]);
            } else {
                setLoans(initialLoans);
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentSort, searchTerm, initialLoans, isLocalVisible]); // Dependencia de isLocalVisible para re-formatear

    const handleSort = (field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        setLoans(sortLoans([...loans], field, direction));
    };

    const calculateTotals = () => {
        const pending = loans.filter(l => !l.rawStatus && l.id !== "no-results").reduce((s, l) => s + l.rawAmount, 0);
        const paid = loans.filter(l => l.rawStatus && l.id !== "no-results").reduce((s, l) => s + l.rawAmount, 0);
        return { pending, paid };
    };

    const totals = calculateTotals();

    return (
        <div className="min-h-screen bg-[#0a1120] text-white">
            <Toolbar title="Gestión de Cartera" invoice={true} />

            <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-700">
                
                {/* HEADER SECTION CON TOGGLE DE PRIVACIDAD */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                            Préstamos y Créditos<span className="text-blue-500">.</span>
                        </h2>
                        <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase">Control de Cartera General</p>
                    </div>
                    
                    <button 
                        onClick={() => setIsLocalVisible(!isLocalVisible)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        {isLocalVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        {isLocalVisible ? "Ocultar Valores" : "Mostrar Valores"}
                    </button>
                </div>

                {/* KPI CARDS - MÁS PEQUEÑAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 border border-amber-500/20 rounded-3xl p-5 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Cartera Pendiente</p>
                                <h3 className="text-xl font-black tracking-tight mt-0.5">
                                    {formatPrivacyCurrency(totals.pending)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-emerald-500/20 rounded-3xl p-5 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Recuperado</p>
                                <h3 className="text-xl font-black tracking-tight mt-0.5">
                                    {formatPrivacyCurrency(totals.paid)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Card de conteo rápido (Opcional para llenar el grid) */}
                    <div className="hidden lg:block bg-white/5 border border-blue-500/20 rounded-3xl p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Operaciones Totales</p>
                                <h3 className="text-xl font-black tracking-tight mt-0.5">
                                    {loans.filter(l => l.id !== "no-results").length} Registros
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTROLES DE BÚSQUEDA */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-3 mb-8">
                    <div className="flex flex-col lg:flex-row gap-3 items-center">
                        <div className="flex-1 w-full">
                            <SearchBarUniversal 
                                onResultsFound={handleLoansFound}
                                placeholder="Buscar por cliente..."
                                searchType="clients"
                                showResults={false}
                                onSearchTermChange={setSearchTerm}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                            <select
                                value={statusFilter || "all"}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-[11px] font-black uppercase tracking-widest text-white px-4 py-1.5 cursor-pointer"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value} className="bg-[#0a1120]">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE TABLA */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Base de Datos</span>
                        <TableFilter headers={tableHeaders} onSort={handleSort} />
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
                            <Loader2 className="animate-spin text-blue-500 mb-4" size={30} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando...</p>
                        </div>
                    ) : (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <CustomTable
                                title="Historial"
                                headers={tableHeaders}
                                options={true}
                                data={loans.filter(i => i.id !== "no-results").map(l => ({
                                    ...l,
                                    monto: formatPrivacyCurrency(l.rawAmount) // Actualiza el monto según visibilidad
                                }))}
                                contextType="loan"
                                statusColumn={{
                                    key: "estado",
                                    statusMap: { "Pendiente": "yellow", "Pagado": "green" }
                                }}
                                customActions={{
                                    view: (id: string) => router.push(`/${locale}/loans/view/${id}`),
                                    delete: async (id: string) => { if(confirm("¿Eliminar?")) await deleteLoan(id); fetchAllLoans(); },
                                    edit: (id: string) => router.push(`/${locale}/loans/edit/${id}`),
                                    custom: [
                                        { label: "Cobrar", action: (id: string) => updateLoanStatus(id, true).then(() => fetchAllLoans()), icon: "💰" },
                                        { label: "Pendiente", action: (id: string) => updateLoanStatus(id, false).then(() => fetchAllLoans()), icon: "⏳" }
                                    ]
                                }}
                                showDetails={(loan) => (
                                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="grid grid-cols-2 gap-8 w-full">
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Cédula</p>
                                                <p className="text-xs font-bold">{loan.clientIdentification}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Monto Neto</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}