import { Deposit, DepositDao, SupplierDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/supplier-deposits`;

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

export const getListDeposit = async (): Promise<Deposit[]> => {
  const url = `${API_BASE_URL}`; 

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching deposits: ${response.statusText}`);
  }

  const data: Deposit[] = await response.json();

  return data;
};

export const createDeposit = async (body: DepositDao): Promise<Response> => {
    const url = `${API_BASE_URL}`;

    const headersOptions: RequestInit = {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    };

    return fetchWithCredentials(url, headersOptions);
};

export const deleteDeposit = async (id: string): Promise<void> => {
    const urlCompra = `${API_BASE_URL}/${id}`;

    try {
        await fetchWithCredentials(urlCompra, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (rollbackError) {
        console.error("Error durante rollback:", rollbackError);
    }
};