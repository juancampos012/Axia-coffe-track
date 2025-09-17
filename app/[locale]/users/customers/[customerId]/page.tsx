import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import CustomerDetailServer from "@/modules/customers/CustomerDetail/CustomerDetailServer";
import { ClientDAO } from "@/types/Api";
import { envVariables } from "@/utils/config";
import { getPublicClients } from "@/lib/api-clients";

export const dynamic = 'force-dynamic';

interface CustomerPageProps {
    params: Promise<{ customerId: string }>;
}

interface StaticParams {
    customerId: string;
}

export async function generateMetadata({ params }: CustomerPageProps): Promise<Metadata> {
    try {
        const { customerId } = await params;
        const customer = await getCustomer(customerId);
        
        return {
            title: `Cliente: ${customer.firstName}`,
            description: `Detalles del cliente ${customer.identification}`,
        };
    } catch {
        return {
            title: "Cliente no encontrado",
            description: "El cliente solicitado no existe",
        };
    }
}

const getCustomer = async (id: string): Promise<ClientDAO> => {
    try {
        const url = `${envVariables.API_URL}/clients/${id}`;
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
            throw new Error(`Error fetching customer: ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error fetching customer ${id}:`, error);
        notFound();
    }
};

export const generateStaticParams = async (): Promise<StaticParams[]> => {
    try {
        /* console.log("Iniciando generación de páginas estáticas...");
        const customers = await getPublicClients();
        console.log(`Obtenidos ${customers.length} clientes para pre-renderizado`);
        
        return customers.slice(0, 5).map((customer: ClientDAO) => {
            console.log(`Generando página para cliente: ${customer.id}`);
            return { customerId: customer.id };
        }); */
        console.log("Generación de páginas estáticas desactivada");
        return [];
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

export default async function CustomerDetail({ params }: CustomerPageProps) {
    const { customerId } = await params;
    let customer: ClientDAO;
        
    try {
        console.log('Customer ID:', customerId);
        customer = await getCustomer(customerId);
    } catch (error) {
        console.error("Error fetching customer:", error);
        notFound();
    }
    
    return <CustomerDetailServer customerId={customerId} />; 
}
