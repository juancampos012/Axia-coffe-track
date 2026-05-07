const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

/**
 * Función base para manejar las peticiones con credenciales
 */
const fetchWithCredentials = async (url: string, options: RequestInit): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error en la solicitud');
  }

  return response;
};

/**
 * Crea un nuevo movimiento de empaque (Entrega, Devolución o Ajuste)
 */
export const createPackagingMovement = async (body: {
  tenantId: string;
  partnerId: string;
  type: 'DELIVERED_TO_PARTNER' | 'RETURNED_BY_PARTNER' | 'ADJUSTMENT';
  quantity: number;
  description?: string;
}): Promise<any> => {
  const url = `${API_BASE_URL}/partner-packaging`;

  const response = await fetchWithCredentials(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

/**
 * Obtiene todos los movimientos de empaque de un aliado específico
 */
export const getPackagingMovements = async (partnerId: string): Promise<any[]> => {
  const url = `${API_BASE_URL}/partner-packaging/${partnerId}`;
  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

/**
 * Obtiene el saldo actual de empaques de un aliado
 */
export const getPackagingBalance = async (partnerId: string): Promise<{ packagingBalance: number }> => {
  const url = `${API_BASE_URL}/partner-packaging/${partnerId}/balance`;
  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

/**
 * Actualiza un movimiento de empaque existente (PATCH)
 */
export const updatePackagingMovement = async (id: string, body: any): Promise<Response> => {
  const url = `${API_BASE_URL}/partner-packaging/${id}`;
  return fetchWithCredentials(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * Elimina un movimiento de empaque
 */
export const deletePackagingMovement = async (id: string): Promise<Response> => {
  const url = `${API_BASE_URL}/partner-packaging/${id}`;
  return fetchWithCredentials(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
};