import { notFound } from "next/navigation";
import { envVariables } from "@/utils/config";
import { cookies } from "next/headers";

import { Purchase } from "@/types/Api";
import PurchaseDetailClient from "./PurchaseDetailClient";

interface PageProps {
  purchaseId: string ;
}

const getInvoice = async (id: string): Promise<Purchase> => {
  try {
    const url = `${envVariables.API_URL}/purchase-invoices/${id}`;
    console.log('Fetching purchase by ID:', url);

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
      throw new Error(`Error fetching purchase: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching invoice ${id}:`, error);
    notFound();
  }
};

export default async function PurchaseDetailServer({ purchaseId }: PageProps) {
  let invoice: Purchase;

  try {
    console.log('Product ID:', purchaseId);
    invoice = await getInvoice(purchaseId);
  } catch(error) {
    console.error("Error fetching product:", error);
    notFound();
  }

  return <PurchaseDetailClient invoice={invoice} />;
}
