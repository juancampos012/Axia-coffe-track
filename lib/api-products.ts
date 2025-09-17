import { envVariables } from "@/utils/config";
import { ProductDAO } from "@/types/Api";

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

export const getListproducts = async (params?: {
  sortBy?: string;
  order?: 'asc' | 'desc';
  id?: string;
  supplier?: string;
  stock?: number;
  salePrice?: number;
  purchasePrice?: number;
  tax?: number;
}): Promise<ProductDAO[]> => {
  let url = `${envVariables.API_URL}/products`;
  
  if (params) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  console.log('Fetching products from:', url);

  return fetchWithCredentials<ProductDAO[]>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getListproductsByName = async (name: string): Promise<ProductDAO[]> => {
  const url = `${envVariables.API_URL}/products/search?name=${encodeURIComponent(name)}`;
  console.log('Searching products by name:', url);

  return fetchWithCredentials<ProductDAO[]>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getProductById = async (productId: string) => {
  const url = `${envVariables.API_URL}/products/${productId}`;
  console.log('Fetching product by ID:', url);

  return fetchWithCredentials<ProductDAO>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Función para obtener productos sin autenticación (para SSG)
export const getPublicProducts = async () => {
  const url = `${envVariables.API_URL}/products/public/list`;
  console.log('Fetching public products from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sin credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Error al obtener productos públicos');
  }

  return response.json();
};

// Función para obtener un producto por ID sin autenticación (para SSG)
export const getPublicProductById = async (productId: string) => {
  const url = `${envVariables.API_URL}/products/public/${productId}`;
  console.log('Fetching public product by ID:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Sin credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Error al obtener producto público');
  }

  return response.json();
};

