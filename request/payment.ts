const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/payments`;

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

// Tipos para operaciones de balance
export interface BalanceResetResponse {
  success: boolean;
  message: string;
  company: {
    id: string;
    name: string;
    previousBalance: number;
    newBalance: number;
  };
  resetBy: {
    userId: string;
    role: string;
  };
  timestamp: string;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

export interface WithdrawalRequest {
  amount: number;
  description?: string;
}

export interface BalanceOperationResponse {
  success: boolean;
  message: string;
  newBalance: number;
  transactionId?: string;
  timestamp: string;
}

/**
 * Resetear el balance de la empresa a 0
 */
export const resetCompanyBalance = async (): Promise<BalanceResetResponse> => {
  const url = `${API_BASE_URL}/reset-balance`;

  const response = await fetchWithCredentials(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: BalanceResetResponse = await response.json();
  return data;
};
