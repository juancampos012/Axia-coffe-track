import { Company } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/companies`;

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

export const getCompanyById = async (id: string): Promise<Company> => {
  console.log(`${API_BASE_URL}/${id}`);
  const company: Company = await fetchWithCredentials(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('Company fetched:', company);
  return company;
};
