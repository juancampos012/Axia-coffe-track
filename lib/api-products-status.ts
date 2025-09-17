import { ProductDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

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

export const createProduct = async (body: ProductDAO): Promise<Response> => {
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

export const deleteProduct= async (id: string): Promise<ProductDAO[]> => {
  const url = `${API_BASE_URL}/${id}`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: ProductDAO[] = await response.json();
  return data;
};

export const updateProduct = async (body: ProductDAO, id:string): Promise<Response> => {
  const url = `${API_BASE_URL}/${id}`;

  const headersOptions: RequestInit = {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  return fetchWithCredentials(url, headersOptions);
};