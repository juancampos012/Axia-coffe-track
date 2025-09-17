import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { envVariables } from "@/utils/config";
import { Purchase } from "@/types/Api";
import { getPublicPurchaseInvoices } from "@/lib/api-purchase";
import PurchaseDetailServer from "@/modules/make-purchase/PurchaseDetail/PurchaseDetailServer";

export const dynamic = 'force-dynamic';

interface InvoicePageProps {
    params: Promise<{ purchaseId: string }>;
}

interface StaticParams {
    salesInvoicesId: string;
}

export async function generateMetadata({ params }: InvoicePageProps): Promise<Metadata> {
    try {
        const { purchaseId } = await params;
        const invoice = await getInvoice(purchaseId);
        
        return {
            title: `Compra ${invoice.id}`,
            description: `Detalle de la compra del proveedor ${invoice.totalPrice}`,
        };
    } catch {
        return {
            title: "Compra no encontrada",
            description: "La compra solicitada no existe",
        };
    }
}

const getInvoice = async (id: string): Promise<Purchase> => {
    try {
        const url = `${envVariables.API_URL}/purchase-invoices/${id}`;
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
            throw new Error(`Error al obtener la compra: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error al obtener la compra ${id}:`, error);
        notFound();
    }
};

export const generateStaticParams = async (): Promise<StaticParams[]> => {
    try {
/*         console.log("Iniciando generación de páginas estáticas...");
        const invoices = await getPublicPurchaseInvoices();
        console.log(`Obtenidas ${invoices.length} compras para pre-renderizado`);

        return invoices.slice(0, 5).map((invoice: Purchase) => {
            console.log(`Generando página para compra: ${invoice.id}`);
            return { invoiceId: invoice.id };
        }); */
        console.log("Generación de páginas estáticas desactivada");
        return [];
    } catch (error) {
        console.error("Error generando rutas estáticas para compras:", error);
        return [];
    }
};

export default async function InvoiceDetail({ params }: InvoicePageProps) {
    const { purchaseId } = await params;
    return <PurchaseDetailServer purchaseId={purchaseId} />
}
