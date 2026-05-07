const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper unificado para manejar credenciales y errores
const fetchWithCredentials = async (url: string, options: RequestInit): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status}` }));
    throw new Error(errorData.error || errorData.message || 'Error en la solicitud');
  }

  return response;
};

/**
 * OBTENER TODOS LOS GASTOS
 * Ruta: GET /expenses
 */
export const getExpenses = async (): Promise<any[]> => {
  const response = await fetchWithCredentials(`${API_URL}/expenses`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

/**
 * OBTENER UN GASTO POR ID
 * Ruta: GET /expenses/:id
 */
export const getExpenseById = async (id: string): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/expenses/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

/**
 * CREAR UN NUEVO GASTO
 * Ruta: POST /expenses
 * @param body { tenantId, amount, description }
 */
export const createExpense = async (body: { tenantId: string; amount: number; description: string }): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await response.json();
};

/**
 * ACTUALIZAR UN GASTO EXISTENTE
 * Ruta: PUT /expenses/:id
 * @param id ID del gasto
 * @param body { amount, description }
 */
export const updateExpense = async (id: string, body: { amount: number; description: string }): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await response.json();
};

/**
 * ELIMINAR UN GASTO
 * Ruta: DELETE /expenses/:id
 */
export const deleteExpense = async (id: string): Promise<any> => {
  const response = await fetchWithCredentials(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};