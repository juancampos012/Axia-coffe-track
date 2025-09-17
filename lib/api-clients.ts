import { envVariables } from "@/utils/config";
import { ClientDAO } from "@/types/Api";

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

// Función para obtener clientes sin autenticación (para SSG)
export const getPublicClients = async () => {
  const url = `${envVariables.API_URL}/clients/public/list`;
  console.log('Fetching public clients from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sin credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Error al obtener clientes públicos');
  }

  return response.json();
};

// Función para obtener un cliente por ID sin autenticación (para SSG)
export const getPublicClientById = async (clientId: string) => {
  const url = `${envVariables.API_URL}/clients/public/${clientId}`;
  console.log('Fetching public client by ID:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sin credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Error al obtener cliente público');
  }

  return response.json();
};

export const getListClients = async (): Promise<ClientDAO[]> => {
  return fetchWithCredentials<ClientDAO[]>(`${envVariables.API_URL}/clients`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getListClientsByName = async (name: string): Promise<ClientDAO[]> => {
  return fetchWithCredentials<ClientDAO[]>(
    `${envVariables.API_URL}/clients/search?name=${encodeURIComponent(name)}`, 
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

export const getClientById = async (clientId: string): Promise<ClientDAO> => {
  return fetchWithCredentials<ClientDAO>(`${envVariables.API_URL}/clients/${clientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
