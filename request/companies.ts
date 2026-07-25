import { Company } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/companies`;

const fetchWithCredentials = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const company: Company = await fetchWithCredentials(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return company;
};

export const getCompanies = async (): Promise<Company[]> => {
  return fetchWithCredentials(`${API_BASE_URL}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
};

export const createCompany = async (data: {
  nit: string;
  name: string;
  address: string;
  phone: string;
  sector: string;
  logo?: File | null;
}): Promise<Company> => {
  const formData = new FormData();
  formData.append('nit', data.nit);
  formData.append('name', data.name);
  formData.append('address', data.address);
  formData.append('phone', data.phone);
  formData.append('sector', data.sector);
  if (data.logo) formData.append('logo', data.logo);

  return fetchWithCredentials(`${API_BASE_URL}`, {
    method: 'POST',
    body: formData,
  });
};

export const updateCompany = async (
  id: string,
  data: {
    nit: string;
    name: string;
    address: string;
    phone: string;
    sector: string;
    logo?: File | null;
  }
): Promise<Company> => {
  const formData = new FormData();
  formData.append('nit', data.nit);
  formData.append('name', data.name);
  formData.append('address', data.address);
  formData.append('phone', data.phone);
  formData.append('sector', data.sector);
  if (data.logo) formData.append('logo', data.logo);

  return fetchWithCredentials(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    body: formData,
  });
};
