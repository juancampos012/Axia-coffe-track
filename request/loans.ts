const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/loans`;

// Función helper para fetch con credenciales
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

// Tipos específicos para préstamos (actualizados con tenantId)
export interface SimpleLoanFormData {
  clientId: string;
  clientName: string;
  clientIdentification: string;
  amount: number;
  description: string;
  status?: boolean;
  tenantId: string;  // Nuevo campo requerido
}

export interface SimpleLoan {
  id: string;
  clientId: string;
  clientName: string;
  clientIdentification: string;
  amount: number;
  status: boolean;
  tenantId: string;  // Nuevo campo
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    identification: string;
  };
}

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Crear un préstamo simple (actualizado con tenantId)
 */
export const createSimpleLoan = async (body: SimpleLoanFormData): Promise<SimpleLoan> => {
  const url = `${API_BASE_URL}`;

  const response = await fetchWithCredentials(url, {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      status: body.status || false  // false = pendiente, true = devuelto
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: SimpleLoan = await response.json();
  return data;
};

/**
 * Generar recibo PDF del préstamo
 */
export const generateLoanReceipt = async (loanId: string): Promise<{ pdfUrl: string }> => {
  const url = `${API_BASE_URL}/${loanId}/receipt`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Crear blob y URL para el PDF
  const blob = await response.blob();
  const pdfUrl = window.URL.createObjectURL(blob);
  
  return { pdfUrl };
};

/**
 * Obtener lista de préstamos (actualizado para incluir tenantId)
 */
export const getListLoans = async (status?: boolean): Promise<SimpleLoan[]> => {
  let url = `${API_BASE_URL}`;
  const params = new URLSearchParams();
  
  if (status !== undefined) {
    params.append('status', status.toString());
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: SimpleLoan[] = await response.json();
  return data;
};

/**
 * Obtener un préstamo por ID
 */
export const getLoanById = async (id: string): Promise<SimpleLoan> => {
  const url = `${API_BASE_URL}/${id}`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: SimpleLoan = await response.json();
  return data;
};

/**
 * Eliminar un préstamo
 */
export const deleteLoan = async (id: string): Promise<void> => {
  const url = `${API_BASE_URL}/${id}`;

  await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Actualizar estado de un préstamo (actualizado para booleano)
 */
export const updateLoanStatus = async (id: string, status: boolean): Promise<SimpleLoan> => {
  const url = `${API_BASE_URL}/${id}/status`;

  const response = await fetchWithCredentials(url, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: SimpleLoan = await response.json();
  return data;
};

/**
 * Marcar préstamo como devuelto (actualizado para booleano)
 */
export const markLoanAsReturned = async (id: string): Promise<SimpleLoan> => {
  const url = `${API_BASE_URL}/${id}/return`;

  const response = await fetchWithCredentials(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: SimpleLoan = await response.json();
  return data;
};

// ==================== FUNCIONES DE CLIENTES ====================

/**
 * Obtener clientes para préstamos
 */
export const getClientsForLoans = async (): Promise<any[]> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/clients/for-loans`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
};

// ==================== FUNCIONES DE REPORTES ====================

/**
 * Obtener préstamos por cliente
 */
export const getLoansByClient = async (clientId: string): Promise<SimpleLoan[]> => {
  const url = `${API_BASE_URL}/client/${clientId}`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: SimpleLoan[] = await response.json();
  return data;
};

/**
 * Obtener préstamos pendientes
 */
export const getPendingLoans = async (): Promise<SimpleLoan[]> => {
  const url = `${API_BASE_URL}/pending`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: SimpleLoan[] = await response.json();
  return data;
};

/**
 * Generar reporte de préstamos
 */
export const generateLoansReport = async (startDate?: string, endDate?: string): Promise<{ pdfUrl: string }> => {
  let url = `${API_BASE_URL}/report`;
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const blob = await response.blob();
  const pdfUrl = window.URL.createObjectURL(blob);
  
  return { pdfUrl };
};

/**
 * Obtener estadísticas de préstamos
 */
export const getLoansStatistics = async (): Promise<{
  totalPending: number;
  totalAmountPending: number;
  totalReturned: number;
  totalAmountReturned: number;
}> => {
  const url = `${API_BASE_URL}/statistics`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return data;
};

// ==================== FUNCIONES MEJORADAS CON TENANT ====================

/**
 * Crear préstamo con tenantId del usuario actual
 */
export const createLoanWithTenant = async (
  data: Omit<SimpleLoanFormData, 'tenantId'>, 
  tenantId: string
): Promise<SimpleLoan> => {
  return createSimpleLoan({
    ...data,
    tenantId
  });
};

/**
 * Obtener préstamos filtrados por tenant
 */
export const getLoansByTenant = async (tenantId: string, status?: boolean): Promise<SimpleLoan[]> => {
  let url = `${API_BASE_URL}`;
  const params = new URLSearchParams();
  
  params.append('tenantId', tenantId);
  if (status !== undefined) {
    params.append('status', status.toString());
  }
  
  url += `?${params.toString()}`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: SimpleLoan[] = await response.json();
  return data;
};

// ==================== TIPOS PARA EXPORTAR ====================

// Exportar también como alias para compatibilidad
export type LoanFormData = SimpleLoanFormData;
export type LoanDAO = SimpleLoan;

// Exportar funciones con nombres alternativos si prefieres
export const createLoan = createSimpleLoan;
export const getListSimpleLoans = getListLoans;
export const deleteSimpleLoan = deleteLoan;