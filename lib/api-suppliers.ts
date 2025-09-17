import { SupplierDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/suppliers`;

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

export async function getSectorTrends(tenantId: string, region: string, companySize: string) {
  try {
    const response = await fetchWithCredentials(`${process.env.NEXT_PUBLIC_API_URL}/ai/sector-trends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tenantId, region, companySize }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sector trends');
    }

    const data = await response.json();
    return data.trends;  
  } catch (error) {
    console.error('Error fetching sector trends:', error);
    throw error;
  }
}

export const findBetterSuppliers = async (productId: string, searchPriority: string) => {
  try {
    const response = await fetchWithCredentials(`${process.env.NEXT_PUBLIC_API_URL}/ai/find-better-suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        searchPriority,
      }),
    });

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error fetching better suppliers:', error);
    throw error; 
  }
};

export const getListSuppliers = async (): Promise<SupplierDAO[]> => {
  const url = `${API_BASE_URL}`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data: SupplierDAO[] = await response.json();

  return data;
};

export const createSupplier = async (body: SupplierDAO): Promise<Response> => {
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

export const deleteSupplier= async (id: string): Promise<SupplierDAO[]> => {
  const url = `${API_BASE_URL}/${id}`;
  console.log('Fetching products from:', url);

  const response = await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data: SupplierDAO[] = await response.json();
  return data;
};

export const updateSupplier = async (body: SupplierDAO, id:string): Promise<Response> => {
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

export const getListSuppliersByName = async (name: string): Promise<SupplierDAO[]> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/suppliers/search?name=${encodeURIComponent(name)}`;
    console.log('Searching suppliers by name:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Suppliers search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching suppliers:', error);
    return [];
  }
};