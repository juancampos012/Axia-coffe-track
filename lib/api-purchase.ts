import { Compra, CreatedPurchase, FactorCompra } from "@/types/Api";
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

export const getListSalePurchases = async (): Promise<CreatedPurchase[]> => {
  let url = `${envVariables.API_URL}/purchase-invoices`;

  return fetchWithCredentials<CreatedPurchase[]>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deletePurchaseInvoice = async (id: string): Promise<void> => {
    const urlCompra = `${envVariables.API_URL}/purchase-invoices/${id}`;

    try {
        await fetchWithCredentials<void>(urlCompra, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
    }
};

// Función para obtener compras sin autenticación (para SSG)
export const getPublicPurchaseInvoices = async () => {
  const url = `${envVariables.API_URL}/purchase-invoices/public/list`;
  console.log('Fetching public purchase invoices from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sin credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Error al obtener compras públicas');
  }

  return response.json();
};

export const crearCompra = async (compra: Compra): Promise<CreatedPurchase> => {
    const urlCompra = `${envVariables.API_URL}/purchase-invoices`;

    const facturaPayload = {
        tenantId: compra.tenantId,
        supplierId: compra.supplierId,
        date: new Date(),
        totalPrice: compra.totalPrice,
    };

    const facturaRes = await fetchWithCredentials<CreatedPurchase>(urlCompra, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facturaPayload),
    });

    const urlProductosFactura = `${envVariables.API_URL}/purchase-product-invoices`;
    
    await Promise.all(
        compra.products.map(p =>
        fetchWithCredentials<void>(urlProductosFactura, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantId: p.tenantId,
                productId: p.productId,
                invoiceId: facturaRes.id,
                quantity: p.quantity,
            }),
        })
        )
    );

    return facturaRes;
};

export const getPurchaseById = async (id: string): Promise<Compra> => {
  let url = `${envVariables.API_URL}/purchase-invoices/${id}`;
        
  return fetchWithCredentials<Compra>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Crear compra por factor.
 * Usa el endpoint de SaleInvoice (compra AL cliente/productor).
 * → Aparece en /sales/sales-invoices
 * → Incrementa el stock del producto
 * → Decrementa el balance de caja (se paga al cliente)
 */
export const crearCompraFactor = async (compra: FactorCompra): Promise<any> => {
  const urlSale = `${envVariables.API_URL}/sale-invoices`;

  const payload = {
    tenantId:      compra.tenantId,
    clientId:      compra.clientId,
    totalPrice:    compra.totalPrice,
    electronicBill: compra.electronicBill ?? false,
    products: compra.products.map(p => ({
      productId: p.productId,
      quantity:  p.quantity,
      unitPrice: p.unitPrice,
    })),
  };

  return fetchWithCredentials<any>(urlSale, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const actualizarCompra = async (id: string, compra: Compra): Promise<void> => {
  const urlCompra = `${envVariables.API_URL}/purchase-invoices/${id}`;

  const payload = {
    supplierId: compra.supplierId,
    date: compra.date,
    totalPrice: compra.totalPrice,
    products: compra.products.map((p) => ({
      productId: p.productId,
      quantity: p.quantity,
    })),
  };

  await fetchWithCredentials<void>(urlCompra, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};
