import { ClientDAO, EmployeeDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const fetchWithCredentials = async (url: string, options: RequestInit): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.error || errorData.message || 'Error en la solicitud');
  }

  return response;
};

/** Crea el usuario ADMIN (u otro rol) de una empresa recién creada. Solo SUPERADMIN puede indicar tenantId. */
export const createUserForCompany = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
  tenantId: string;
}): Promise<any> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('role', data.role);
  formData.append('tenantId', data.tenantId);

  const response = await fetchWithCredentials(`${API_BASE_URL}/users`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const createCustomer = async (body: ClientDAO): Promise<Response> => {
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

export const createEmployee = async (body: EmployeeDAO): Promise<Response> => {
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

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ClientDAO[] = await response.json();
  return data;
};

export const deleteCustomers = async (id: string): Promise<void> => {
  const url = `${API_BASE_URL}/clients/${id}`;

  await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteEmployees = async (id: string): Promise<void> => {
  const url = `${API_BASE_URL}/users/${id}`;

  await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
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

export const getUserById = async (id: string): Promise<any> => {
  const url = `${API_BASE_URL}/users/${id}`;
  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

/** Actualiza datos propios de la cuenta (nombre, email y/o contraseña) */
export const updateOwnAccount = async (
  id: string,
  body: { name?: string; email?: string; password?: string }
): Promise<any> => {
  const url = `${API_BASE_URL}/users/${id}`;
  const response = await fetchWithCredentials(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
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