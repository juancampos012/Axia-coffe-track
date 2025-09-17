import { notFound } from "next/navigation";
import { envVariables } from "@/utils/config";
import { cookies } from "next/headers";

import InvoiceDetailClient from "./InvoiceDetailClient";
import { Invoice } from "@/types/Api";

interface PageProps {
  invoiceId: string ;
}

const getInvoice = async (id: string): Promise<Invoice> => {
  try {
    const url = `${envVariables.API_URL}/sale-invoices/${id}`;
    console.log('Fetching invoice by ID:', url);

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const cookieHeader = allCookies
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
      throw new Error(`Error fetching invoice: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    notFound();
  }
};

export default async function InvoiceDetailServer({ invoiceId }: PageProps) {
  let invoice: Invoice;

  try {
    console.log('Product ID:', invoiceId);
    invoice = await getInvoice(invoiceId);
  } catch(error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  return <InvoiceDetailClient invoice={invoice} />;
}
