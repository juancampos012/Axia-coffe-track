import { notFound } from "next/navigation";
import { envVariables } from "@/utils/config";
import { cookies } from "next/headers";

import { EmployeeDAO } from "@/types/Api";
import EmployeeDetailClient from "./EmployeeDetailClient";

interface EmployeeDetailServerProps {
    employeeId: string;
}

export async function EmployeeDetailServer({ employeeId }: EmployeeDetailServerProps) {
    let employee: EmployeeDAO;
    
    try {
        console.log('Employee ID:', employeeId);
        employee = await getEmployee(employeeId);
    } catch (error) {
        console.error("Error fetching employee:", error);
        notFound();
    }
    
    return <EmployeeDetailClient employee={employee} />;
}

const getEmployee = async (id: string): Promise<EmployeeDAO> => {
    try {
        const url = `${envVariables.API_URL}/users/${id}`;
        console.log('Fetching employee by ID (server):', url);
        
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        
        const cookieHeader = allCookies
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        
        console.log('Available cookies:', allCookies.map(c => c.name));
        
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

export default EmployeeDetailServer;
