import { AnnouncementDAO } from "@/types/Api"; // Asegúrate de tener este tipo en tu archivo de tipos

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

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

export const createAnnouncement = async (body: any): Promise<Response> => {
  const url = `${API_BASE_URL}/announcements`;

  return fetchWithCredentials(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getAnnouncements = async (): Promise<any[]> => {
  const url = `${API_BASE_URL}/announcements`;
  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const getAnnouncementsByClient = async (clientId: string): Promise<any[]> => {
  const url = `${API_BASE_URL}/announcements/client/${clientId}`;
  const response = await fetchWithCredentials(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const deleteAnnouncement = async (id: string): Promise<Response> => {
  const url = `${API_BASE_URL}/announcements/${id}`;
  return fetchWithCredentials(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
};