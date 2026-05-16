/**
 * request/accounts.ts
 * API unificada para el módulo de Cuentas Consolidadas.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchWithCredentials = async (url: string, options: RequestInit): Promise<Response> => {
  const response = await fetch(url, { ...options, credentials: 'include' });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: `Error ${response.status}` }));
    throw new Error(err.message || err.error || 'Error en la solicitud');
  }
  return response;
};

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type AccountType = 'partners' | 'clients' | 'suppliers';

export interface AccountMovement {
  id: string;
  createdAt: string;
  type: 'cargo' | 'abono';
  amount: number;
  description: string;
  balanceAfter?: number;
}

export interface AccountSummary {
  personId: string;
  personName: string;
  balance: number;
  totalCharged: number;
  totalPaid: number;
}

export interface AccountDetail {
  personId: string;
  personName: string;
  personPhone?: string;
  personEmail?: string;
  balance: number;
  totalCharged: number;
  totalPaid: number;
  movements: AccountMovement[];
}

// Helper: normalise summary response from backend
function normaliseSummary(json: any, idKey: string, nameKey: string): AccountSummary[] {
  const list: any[] = Array.isArray(json) ? json : (json.summary ?? []);
  return list.map((item): AccountSummary => ({
    personId:     item[idKey]   ?? item.personId   ?? item.id   ?? '',
    personName:   item[nameKey] ?? item.personName ?? item.name ?? '',
    balance:      Number(item.pendingAmount ?? item.balance ?? 0),
    totalCharged: Number(item.totalDebt    ?? item.totalCharged ?? 0),
    totalPaid:    Number(item.totalPaid    ?? 0),
  }));
}

// ─── ALIADOS ─────────────────────────────────────────────────────────────────

export const getPartnerAccountsSummary = async (): Promise<AccountSummary[]> => {
  const r = await fetchWithCredentials(`${API_URL}/partner-accounts/summary`, {
    method: 'GET', headers: { 'Content-Type': 'application/json' },
  });
  return normaliseSummary(await r.json(), 'partnerId', 'partnerName');
};

export const getPartnerAccountDetail = async (partnerId: string): Promise<AccountDetail> => {
  const r = await fetchWithCredentials(`${API_URL}/partner-accounts/detail/${partnerId}`, {
    method: 'GET', headers: { 'Content-Type': 'application/json' },
  });
  return r.json();
};

/** Abono: el aliado nos paga */
export const partnerPayment = async (body: {
  partnerId: string; amount: number; description?: string; affectsBalance?: boolean;
}): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/partner-accounts/payment-by-partner`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
};

/** Cargo: le entregamos algo y nos debe */
export const partnerCharge = async (body: {
  partnerId: string; tenantId: string; amount: number; description?: string;
}): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/partner-accounts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, originalAmount: body.amount }),
  });
  return r.json();
};

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export const getClientAccountsSummary = async (): Promise<AccountSummary[]> => {
  const r = await fetchWithCredentials(`${API_URL}/client-accounts/summary`, {
    method: 'GET', headers: { 'Content-Type': 'application/json' },
  });
  return normaliseSummary(await r.json(), 'clientId', 'clientName');
};

export const getClientAccountDetail = async (clientId: string): Promise<AccountDetail> => {
  const r = await fetchWithCredentials(`${API_URL}/client-accounts/detail/${clientId}`, {
    method: 'GET', headers: { 'Content-Type': 'application/json' },
  });
  return r.json();
};

export const clientPayment = async (body: {
  clientId: string; amount: number; description?: string; affectsBalance?: boolean;
}): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/client-accounts/payment-by-client`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
};

export const clientCharge = async (body: {
  clientId: string; tenantId: string; amount: number; description?: string;
}): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/client-accounts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, originalAmount: body.amount }),
  });
  return r.json();
};

// ─── PROVEEDORES ──────────────────────────────────────────────────────────────

export const getSupplierAccountsSummary = async (): Promise<AccountSummary[]> => {
  const r = await fetchWithCredentials(`${API_URL}/supplier-accounts/summary`, {
    method: 'GET', headers: { 'Content-Type': 'application/json' },
  });
  return normaliseSummary(await r.json(), 'supplierId', 'supplierName');
};

export const getSupplierAccountDetail = async (supplierId: string): Promise<AccountDetail> => {
  const r = await fetchWithCredentials(`${API_URL}/supplier-accounts/detail/${supplierId}`, {
    method: 'GET', headers: { 'Content-Type': 'application/json' },
  });
  return r.json();
};

export const supplierPayment = async (body: {
  supplierId: string; amount: number; description?: string; affectsBalance?: boolean;
}): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/supplier-accounts/payment-by-supplier`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
};

export const supplierCharge = async (body: {
  supplierId: string; tenantId: string; amount: number; description?: string;
}): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/supplier-accounts`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, originalAmount: body.amount }),
  });
  return r.json();
};

// ─── EDITAR MOVIMIENTOS ───────────────────────────────────────────────────────

export const editPartnerMovement = async (paymentId: string, body: { description?: string; amount?: number }): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/partner-accounts/payment/${paymentId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
};

export const editClientMovement = async (paymentId: string, body: { description?: string; amount?: number }): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/client-accounts/payment/${paymentId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
};

export const editSupplierMovement = async (paymentId: string, body: { description?: string; amount?: number }): Promise<any> => {
  const r = await fetchWithCredentials(`${API_URL}/supplier-accounts/payment/${paymentId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
};
