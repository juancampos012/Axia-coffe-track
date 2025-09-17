import { CreatedInvoice, Venta } from "@/types/Api";
import { envVariables } from "@/utils/config";

const fetchWithCredentials = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en la solicitud');
  }

  return response.json() as Promise<T>;
};

export const getListSaleInvoices = async (): Promise<CreatedInvoice[]> => {
  let url = `${envVariables.API_URL}/sale-invoices`;

  return fetchWithCredentials<CreatedInvoice[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const searchInvoicesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<CreatedInvoice[]> => {
  if (!startDate || !endDate) {
    throw new Error("Se requieren fechas de inicio y fin");
  }

  const url = `${envVariables.API_URL}/sale-invoices/searchByDateRange?startDate=${encodeURIComponent(
    startDate
  )}&endDate=${encodeURIComponent(endDate)}`;

  return fetchWithCredentials<CreatedInvoice[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteSaleInvoice = async (id: string): Promise<void> => {
  const url = `${envVariables.API_URL}/sale-invoices/${id}`;

  await fetchWithCredentials<void>(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getListInvoicesByClientName = async (name: string): Promise<CreatedInvoice[]> => {
  const url = `${envVariables.API_URL}/sale-invoices/search?name=${encodeURIComponent(name)}`;

  return fetchWithCredentials<CreatedInvoice[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Función para obtener facturas sin autenticación (para SSG)
export const getPublicSaleInvoices = async () => {
  const url = `${envVariables.API_URL}/sale-invoices/public/list`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sin credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Error al obtener productos públicos');
  }

  return response.json();
};

export const crearFacturaVenta = async (venta: Venta): Promise<CreatedInvoice> => {
  const urlFactura = `${envVariables.API_URL}/sale-invoices`;

  const facturaPayload = {
    clientId: venta.clientId,
    totalPrice: venta.totalPrice,
    tenantId: venta.tenantId,
    electronicBill: venta.electronicBill ?? false,
    payment: venta.payment ?? null
  };
  
  const factura = await fetchWithCredentials<CreatedInvoice>(urlFactura, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(facturaPayload)
  });

  const urlProductosFactura = `${envVariables.API_URL}/sale-product-invoices`;
  // Asociar productos a la factura
  await Promise.all(
    venta.products.map(p =>
      fetchWithCredentials<void>(urlProductosFactura, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: p.tenantId,
          productId: p.productId,
          invoiceId: factura.id,
          quantity: p.quantity
        })
      })
    )
  );

  return factura;
};
