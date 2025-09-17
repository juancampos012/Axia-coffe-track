import { UserDataLogin, UserDataRegister } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

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

export const loginUser = async (body: UserDataLogin): Promise<Response> => {
  const url = `${API_BASE_URL}/login`;

  const headersOptions: RequestInit = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetchWithCredentials(url, headersOptions);
};

export const registerUser = async (body: UserDataRegister): Promise<Response> => {
  const url = `${API_BASE_URL}/new-user`;

  const headersOptions: RequestInit = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetchWithCredentials(url, headersOptions);
};