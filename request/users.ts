import { ClientDAO, EmployeeDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

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

export const createCustomer = async (body: ClientDAO, authToken: string): Promise<Response> => {
  const url = `${API_BASE_URL}/clients`;

  const headersOptions: RequestInit = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetchWithCredentials(url, headersOptions);
};

export const createEmployee = async (body: EmployeeDAO, authToken: string): Promise<Response> => {
    const url = `${API_BASE_URL}/users`;
  
    const headersOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    };
  
    return fetchWithCredentials(url, headersOptions);
  };
  
export const getListEmployees = async (): Promise<EmployeeDAO[]> => {
  const url = `${API_BASE_URL}/users`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: EmployeeDAO[] = await response.json();
  return data;
};

export const getListCustomers = async (): Promise<ClientDAO[]> => {
  const url = `${API_BASE_URL}/clients`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ClientDAO[] = await response.json();
  return data;
};

export const deleteCustomers = async (id: string): Promise<ClientDAO[]> => {
  const url = `${API_BASE_URL}/clients/${id}`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ClientDAO[] = await response.json();
  return data;
};

export const deleteEmployees = async (id: string): Promise<EmployeeDAO[]> => {
  const url = `${API_BASE_URL}/users/${id}`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: EmployeeDAO[] = await response.json();
  return data;
};

export const updateCustomer = async (body: ClientDAO, id:string): Promise<Response> => {
  const url = `${API_BASE_URL}/clients/${id}`;

  const headersOptions: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetchWithCredentials(url, headersOptions);
};

export const updateEmployee = async (body: EmployeeDAO, id:string): Promise<Response> => {
  const url = `${API_BASE_URL}/users/${id}`;

  const headersOptions: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetchWithCredentials(url, headersOptions);
};