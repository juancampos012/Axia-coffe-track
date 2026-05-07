// request/partner.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper unificado para enviar las cookies de sesión automáticamente
const fetchWithCredentials = async (url: string, options: RequestInit): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (!response.ok) {
    // Intentamos extraer el mensaje de error del backend
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status}` }));
    throw new Error(errorData.error || errorData.message || 'Error en la solicitud');
  }

  return response;
};

/**
 * OBTENER TODOS LOS SOCIOS (Dashboard)
 * Ruta: GET /partners
 */
export const getAllPartners = async (): Promise<any[]> => {
  const response = await fetchWithCredentials(`${API_URL}/partners`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

/**
 * CREAR UN NUEVO SOCIO
 * Ruta: POST /partners
 * @param body { name, identification, phone, email, address, notes, tenantId }
 */
export const createPartner = async (body: any): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/partners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await response.json();
};

/**
 * OBTENER SOCIO POR ID (Detalle/Expediente)
 * Ruta: GET /partners/:id
 */
export const getPartnerById = async (id: string): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/partners/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

/**
 * OBTENER CUENTAS POR SOCIO
 * Ruta: GET /partner-accounts/partner/:partnerId
 */
export const getPartnerAccounts = async (partnerId: string): Promise<any[]> => {
  const response = await fetchWithCredentials(`${API_URL}/partner-accounts/partner/${partnerId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

/**
 * OBTENER PAGOS/MOVIMIENTOS POR SOCIO
 * Ruta: GET /partner-payments/:partnerId
 */
export const getPartnerPayments = async (partnerId: string): Promise<any[]> => {
  const response = await fetchWithCredentials(`${API_URL}/partner-payments/${partnerId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

/**
 * CREAR UNA NUEVA CUENTA / DEUDA (Entrega de café)
 * Ruta: POST /partner-accounts
 * @param body { partnerId, tenantId, originalAmount, description }
 */
export const createPartnerAccount = async (body: any): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/partner-accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await response.json();
};

/**
 * REGISTRAR UN ABONO A UNA CUENTA EXISTENTE
 * Ruta: POST /partner-accounts/payment
 * @param body { accountId, amount, description }
 */
export const addPartnerAccountPayment = async (body: any): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/partner-accounts/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await response.json();
};