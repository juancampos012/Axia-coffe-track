import { AnnouncementDAO } from "@/types/Api";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

/**
 * Función base para peticiones con credenciales (cookies)
 */
const fetchWithCredentials = async (url: string, options: RequestInit): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Importante para que el backend reconozca la sesión
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error en la solicitud');
  }

  return response;
};

/**
 * Crea una nueva fijación o anuncio
 */
export const createAnnouncement = async (body: Partial<AnnouncementDAO>): Promise<AnnouncementDAO> => {
  const url = `${API_BASE_URL}/announcements`;

  const response = await fetchWithCredentials(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

/**
 * Obtiene todos los anuncios del tenant actual
 */
export const getAnnouncements = async (): Promise<AnnouncementDAO[]> => {
  const url = `${API_BASE_URL}/announcements`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};

/**
 * Obtiene anuncios activos de un cliente específico (Uso en MakeSale)
 */
export const getAnnouncementsByClient = async (clientId: string): Promise<AnnouncementDAO[]> => {
  const url = `${API_BASE_URL}/announcements/client/${clientId}`;

  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};

/**
 * Elimina un anuncio por ID
 */
export const deleteAnnouncement = async (id: string): Promise<{ message: string }> => {
  const url = `${API_BASE_URL}/announcements/${id}`;

  const response = await fetchWithCredentials(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};