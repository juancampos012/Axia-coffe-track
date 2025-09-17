import { envVariables } from "@/utils/config";
import { SaleItemForAPI } from "@/types/Api";

const fetchWithCredentials = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || 'Error en la solicitud');
  }

  return response.json() as Promise<T>;
};

export const createSaleInvoice = async ({
  tenantId,
  clientId,
  totalPrice,
  electronicBill,
  products
}: {
  tenantId: string;
  clientId: string;
  totalPrice: number;
  electronicBill: boolean;
  products: SaleItemForAPI[];
}) => {
  return fetchWithCredentials(`${envVariables.API_URL}/sale-invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenantId,
      clientId,
      totalPrice,
      electronicBill,
      products
    }),
  });
};

export const createPayment = async ({
  tenantId,
  amount,
  paymentMethod,
  reference,
  invoiceId
}: {
  tenantId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  invoiceId: string;
}) => {
  return fetchWithCredentials(`${envVariables.API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tenantId,
      amount,
      paymentMethod,
      reference,
      invoiceId
    }),
  });
};