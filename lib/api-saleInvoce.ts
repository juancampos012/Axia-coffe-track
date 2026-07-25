import { CreatedInvoice, Venta } from "@/types/Api";
import { envVariables } from "@/utils/config";

const fetchWithCredentials = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.message || 'Error en la solicitud');
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

export const viewSaleInvoicePDF = async (id: string): Promise<void> => {
  const url = `${envVariables.API_URL}/sale-invoices/${id}/pdf`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el recibo");
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
};

/** Edita cantidad y/o precio unitario del único producto de la factura (ajusta stock y balance) */
export const updateSaleInvoiceItem = async (
  id: string,
  body: { items: Array<{ id: string; productId?: string; quantity?: number; unitPrice?: number }> }
): Promise<any> => {
  const url = `${envVariables.API_URL}/sale-invoices/${id}`;
  const response = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Error al editar la factura");
  }
  return data;
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
    payment: venta.payment ?? null,
    products: venta.products.map(p => ({
      productId: p.productId,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      tenantId: p.tenantId,
      announcementId: p.announcementId || null
    }))
  };

  const factura = await fetchWithCredentials<CreatedInvoice>(urlFactura, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(facturaPayload)
  })

  return factura;
};
