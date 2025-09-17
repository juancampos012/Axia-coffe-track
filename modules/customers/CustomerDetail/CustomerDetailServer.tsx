import { notFound } from "next/navigation";
import { envVariables } from "@/utils/config";
import { cookies } from "next/headers";

import { ClientDAO } from "@/types/Api";
import CustomerDetailClient from "./CustomerDetailClient";

interface CustomerDetailServerProps {
    customerId: string;
}

export async function CustomerDetailServer({ customerId }: CustomerDetailServerProps) {
    let customer: ClientDAO;
    
    try {
        console.log('Customer ID:', customerId);
        customer = await getCustomer(customerId);
    } catch (error) {
        console.error("Error fetching customer:", error);
        notFound();
    }
    
    return <CustomerDetailClient customer={customer} />;
}

const getCustomer = async (id: string): Promise<ClientDAO> => {
    try {
        const url = `${envVariables.API_URL}/clients/${id}`;
        console.log('Fetching customer by ID (server):', url);
        
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
            throw new Error(`Error fetching customer: ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        notFound();
    }
};

export default CustomerDetailServer;
