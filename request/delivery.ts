import { DeliveryDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

const fetchWithCredentials = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Error desconocido" }));

    throw new Error(errorData.message || "Error en la solicitud");
  }

  return response;
};

export const createDelivery = async (body: any): Promise<Response> => {
  const url = `${API_BASE_URL}/deliveries`;

  return fetchWithCredentials(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getDeliveries = async (): Promise<DeliveryDAO[]> => {
  const url = `${API_BASE_URL}/deliveries`;

  const response = await fetchWithCredentials(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const getDeliveryById = async (
  id: string
): Promise<DeliveryDAO> => {
  const url = `${API_BASE_URL}/deliveries/${id}`;

  const response = await fetchWithCredentials(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const updateDelivery = async (
  id: string,
  body: any
): Promise<Response> => {
  const url = `${API_BASE_URL}/deliveries/${id}`;

  return fetchWithCredentials(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteDelivery = async (
  id: string
): Promise<Response> => {
  const url = `${API_BASE_URL}/deliveries/${id}`;

  return fetchWithCredentials(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};