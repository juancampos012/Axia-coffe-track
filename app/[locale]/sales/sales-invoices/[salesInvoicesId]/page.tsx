import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { Invoice } from "@/types/Api";
import { envVariables } from "@/utils/config";
import { getPublicSaleInvoices } from "@/lib/api-saleInvoce";
import InvoiceDetailServer from "@/modules/sales/SaleInvoiceDetail/InvoiceDetailServer";

export const dynamic = 'force-dynamic';

interface InvoicePageProps {
    params: Promise<{ salesInvoicesId: string }>;
}

interface StaticParams {
    salesInvoicesId: string;
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
    try {
        const { salesInvoicesId } = await params;
        const invoice = await getInvoice(salesInvoicesId);
        
        return {
            title: `Factura ${invoice.id}`,
            description: `Detalle de la factura del cliente ${invoice.totalPrice}`,
        };
    } catch {
        return {
            title: "Factura no encontrada",
            description: "La factura solicitada no existe",
        };
    }
}

const getInvoice = async (id: string): Promise<Invoice> => {
    try {
        const url = `${envVariables.API_URL}/sale-invoices/${id}`;
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Response status:', response.status);
            throw new Error(`Error al obtener la factura: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error al obtener la factura ${id}:`, error);
        notFound();
    }
};

export const generateStaticParams = async (): Promise<StaticParams[]> => {
    try {
/*         console.log("Iniciando generación de páginas estáticas...");
        const invoices = await getPublicSaleInvoices();
        console.log(`Obtenidas ${invoices.length} facturas para pre-renderizado`);

        return invoices.slice(0, 5).map((invoice: Invoice) => {
            console.log(`Generando página para factura: ${invoice.id}`);
            return { invoiceId: invoice.id };
        }); */
        console.log("Generación de páginas estáticas desactivada");
        return [];
    } catch (error) {
        console.error("Error generando rutas estáticas para facturas:", error);
        return [];
    }
};

export default async function InvoiceDetail({ params }: InvoicePageProps) {
    const { salesInvoicesId } = await params;
    return <InvoiceDetailServer invoiceId={salesInvoicesId} />
}
