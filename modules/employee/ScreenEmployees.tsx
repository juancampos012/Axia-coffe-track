'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import EmployeeForm from "./EmployeeForm";
import EmployeeFormEdit from "./EmployeeFormEdit";
import Toolbar from "@/components/organisms/ToolBar";
import EmptyState from '@/components/molecules/EmptyState';
import TableFilter from "@/components/molecules/TableFilter";
import CustomTable from "@/components/organisms/CustomTable";
import SearchBarUniversal from "@/components/molecules/SearchBar";
import { getListEmployees, deleteEmployees } from "@/request/users";
import EmployeeDetailModal from "./EmployeeDetail/EmployeeDetailModal";
import CustomModalNoButton from "@/components/organisms/CustomModalNoButton";
import { 
    ClientDAO, 
    CreatedInvoice, 
    EmployeeDAO, 
    ProductDAO, 
    SupplierDAO 
} from "@/types/Api";

export default function ScreenEmployees() {
    const router = useRouter();
    const initialFetchDone = useRef(false);
    const t = useTranslations("Employees");

    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
        const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [employees, setEmployees] = useState<{ [key: string]: string }[]>([]);
    const [currentEmployee, setCurrentEmployee] = useState<EmployeeDAO | null>(null);
    const [initialEmployees, setInitialEmployees] = useState<{ [key: string]: string }[]>([]);
    const [currentSort, setCurrentSort] = useState<{field: string, direction: 'asc' | 'desc'} | null>(null);
    
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchAllEmployees();
            initialFetchDone.current = true;
        }
    }, []);

    const fetchAllEmployees = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const res = await getListEmployees();
            if (res && Array.isArray(res)) {
                const formattedData = formatEmployees(res);
                setInitialEmployees(formattedData);
                
                if(currentSort) {
                    const sortedData = sortEmployees(formattedData, currentSort.field, currentSort.direction);
                    setEmployees(sortedData);
                } else {
                    setEmployees(formattedData);
                }
            }
        } catch (err) {
            console.error(t('employees.fetchError'), err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatEmployees = (employeeList: EmployeeDAO[]) => {
        return employeeList.map((employee) => ({
            id: employee.id,
            name: employee.name,
            role: employee.role,
            email: employee.email,
        }));
    };

    const sortEmployees = (data: { [key: string]: string }[], field: string, direction: 'asc' | 'desc') => {
        return [...data].sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleEmployeesFound = useCallback((results: ProductDAO[] | EmployeeDAO[] | SupplierDAO[] | ClientDAO[] | CreatedInvoice[]) => {
        const employeeResults = results.filter((result): result is EmployeeDAO => 
            'name' in result && 'role' in result
        );
        
        if (employeeResults.length > 0) {
            const formattedData = formatEmployees(employeeResults);
            
            if (currentSort) {
                const sortedData = sortEmployees(formattedData, currentSort.field, currentSort.direction);
                setEmployees(sortedData);
            } else {
                setEmployees(formattedData);
            }
        } else if (searchTerm && searchTerm.length >= 2) {
            setEmployees([{
                id: "no-results",
                name: `No se encontraron empleados para: "${searchTerm}"`,
                role: "",
                email: "",
            }]);
        } else {
            if (currentSort) {
                const sortedData = sortEmployees([...initialEmployees], currentSort.field, currentSort.direction);
                setEmployees(sortedData);
            } else {
                setEmployees([...initialEmployees]);
            }
        }
    }, [currentSort, initialEmployees, searchTerm]);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setCurrentSort({ field, direction });
        const sortedEmployees = sortEmployees([...employees], field, direction);
        setEmployees(sortedEmployees);
    }, [employees]);

    const handleEditEmployee = (employeeId: string) => {
        const employeeToEdit = initialEmployees.find(emp => emp.id === employeeId);
        if (employeeToEdit) {
            setCurrentEmployee({
                id: employeeToEdit.id,
                name: employeeToEdit.name,
                role: employeeToEdit.role,
                email: employeeToEdit.email,
            });
            setIsModalOpen(true);
        }
    };

    const handleViewEmployee = (employeeId: string) => {
        const employeeToView = initialEmployees.find(emp => emp.id === employeeId);
        if (employeeToView) {
            setCurrentEmployee({
                id: employeeToView.id,
                name: employeeToView.name,
                role: employeeToView.role,
                email: employeeToView.email,
            });
            //router.push(`/users/employees/${employeeId}`);
            setIsViewModalOpen(true);
        }
    };

    const handleDeleteEmployee = (employeeId: string) => {
        deleteEmployees(employeeId)
        .then(() => {
            fetchAllEmployees();
        })
        .catch((err) => {
            console.error(t('employees.deleteError'), err);
        });
    };

    const tableHeaders = [
        { label: t("tableHeaders.id"), key: "id" },
        { label: t("tableHeaders.name"), key: "name" },
        { label: t("tableHeaders.role"), key: "role" },
        { label: t("tableHeaders.email"), key: "email" },
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
                    fetchAllEmployees();
                }} 
                title={t("addNew")}
            >
                <EmployeeForm 
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchAllEmployees();
                    }} 
                />
            </CustomModalNoButton>
            
            <div className="flex justify-between items-center mb-4 mt-4">
                <div className="w-72">
                    <SearchBarUniversal 
                        onResultsFound={handleEmployeesFound} 
                        showResults={false}
                        placeholder={t("searchPlaceholder")}
                        searchType="employees"
                        onSearchTermChange={setSearchTerm}
                    />
                </div>
                <TableFilter 
                    headers={tableHeaders}
                    onSort={handleSort} 
                />
            </div>
            
            {isLoading && <p className="text-gray-500 text-sm mb-2">{t("loading")}</p>}
            
            {/* Show empty state when search has no results */}
            {searchTerm && searchTerm.length >= 2 && employees.length === 1 && employees[0].id === "no-results" ? (
                <EmptyState
                    message={t("noResults")} 
                    searchTerm={searchTerm} 
                />
            ) : (
                <CustomTable
                    title={t("listTitle")}
                    headers={tableHeaders}
                    options={true}
                    data={employees.filter(e => e.id !== "no-results")}
                    contextType="employees"
                    customActions={{
                        edit: handleEditEmployee,
                        view: handleViewEmployee,
                        delete: handleDeleteEmployee,
                    }}
                />
            )}

            <CustomModalNoButton 
                isOpen={isModalOpen} 
                onClose={() => {setIsModalOpen(false); fetchAllEmployees();}} 
                title={t("edit")}
            >
                <EmployeeFormEdit 
                    employee={currentEmployee || undefined}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchAllEmployees();
                    }} 
                />
            </CustomModalNoButton>

            <EmployeeDetailModal
                employee={currentEmployee}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />
        </div>
    );
}