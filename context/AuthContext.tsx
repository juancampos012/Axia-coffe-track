"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { envVariables } from '@/utils/config';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario ya está autenticado con el token JWT
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // Extraer información del token JWT en lugar de llamar a un endpoint
        const authToken = Cookies.get('authToken');
        
        if (authToken) {
          try {
            // Decodificar el token para obtener la información del usuario
            const decoded = jwtDecode<{
              id: string;
              name: string;
              email: string;
              role: string;
              tenantId: string;
            }>(authToken);
            
            // Establecer el usuario basado en el token
            setUser({
              id: decoded.id,
              name: decoded.name || '',
              email: decoded.email || '',
              role: decoded.role,
              tenantId: decoded.tenantId
            });
          } catch (err) {
            console.error('Error decodificando token:', err);
          }
        }
      } catch (err) {
        console.error('Error verificando estado de autenticación:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar la ruta correcta para el login
      const response = await fetch(`${envVariables.API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Error de inicio de sesión');
      }
      
      const userData = await response.json();
      setUser(userData.user); // Datos del usuario están en userData.user
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de inicio de sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Usar la ruta correcta para el logout
      await fetch(`${envVariables.API_URL}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Eliminar la cookie manualmente
      Cookies.remove('authToken');
      
      setUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}