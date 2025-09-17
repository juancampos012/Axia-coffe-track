import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { getPublicEmployees } from "@/lib/api-employees";
import { EmployeeDAO } from "@/types/Api";
import { envVariables } from "@/utils/config";
import EmployeeDetailServer from "@/modules/employee/EmployeeDetail/EmployeeDetailServer";

export const dynamic = 'force-dynamic';

interface EmployeePageProps {
    params: Promise<{ employeeId: string }>;
}

interface StaticParams {
    employeeId: string;
}

export async function generateMetadata({ params }: EmployeePageProps): Promise<Metadata> {
    try {
        const { employeeId } = await params;
        const employee = await getEmployee(employeeId);
        
        return {
            title: `Empleado: ${employee.name}`,
            description: `Detalles del empleado ${employee.name}`,
        };
    } catch {
        return {
            title: "Empleado no encontrado",
            description: "El empleado solicitado no existe",
        };
    }
}

const getEmployee = async (id: string): Promise<EmployeeDAO> => {
    try {
        const url = `${envVariables.API_URL}/users/${id}`;
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
            },
            cache: 'no-store',
        });
        
        if (!response.ok) {
            console.error('Response status:', response.status);
            throw new Error(`Error fetching employee: ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error fetching employee ${id}:`, error);
        notFound();
    }
};

export const generateStaticParams = async (): Promise<StaticParams[]> => {
    try {
        /* console.log("Iniciando generación de páginas estáticas...");
        const employees = await getPublicEmployees();
        console.log(`Obtenidos ${employees.length} empleados para pre-renderizado`);
        
        return employees.slice(0, 5).map((employee: EmployeeDAO) => {
            console.log(`Generando página para empleado: ${employee.id}`);
            return { employeeId: employee.id };
        }); */
        console.log("Generación de páginas estáticas desactivada");
        return [];
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

export default async function EmployeeDetailAdmin({ params }: EmployeePageProps) {
    const { employeeId } = await params;
    let employee: EmployeeDAO;
        
    try {
        console.log('Employee ID:', employeeId);
        employee = await getEmployee(employeeId);
    } catch (error) {
        console.error("Error fetching employee:", error);
        notFound();
    }
        
    return <EmployeeDetailServer employeeId={employeeId} />; 
}