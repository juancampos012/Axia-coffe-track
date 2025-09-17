import { envVariables } from "@/utils/config";
import { EmployeeDAO } from "@/types/Api";

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

export const getListEmployees = async (): Promise<EmployeeDAO[]> => {
  const url = `${envVariables.API_URL}/users`;
  console.log('Obteniendo empleados desde:', url);

  return fetchWithCredentials<EmployeeDAO[]>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getListEmployeesByName = async (name: string, role?: string): Promise<EmployeeDAO[]> => {
  let url = `${envVariables.API_URL}/users/search?name=${encodeURIComponent(name)}`;
  if (role) {
    url += `&role=${encodeURIComponent(role)}`;
  }
  console.log('Buscando empleados:', url);

  return fetchWithCredentials<EmployeeDAO[]>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getPublicEmployees = async () => {
  const url = `${envVariables.API_URL}/users/public/list`;
  console.log('Fetching public employees from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener empleados públicos');
  }

  return response.json();
};