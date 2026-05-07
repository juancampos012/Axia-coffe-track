"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { envVariables } from "@/utils/config";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

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
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUserFromToken = (token: string) => {
    try {
      const decoded = jwtDecode<User>(token);

      setUser({
        id: decoded.id,
        name: decoded.name || "",
        email: decoded.email || "",
        role: decoded.role,
        tenantId: decoded.tenantId,
      });
    } catch (err) {
      console.error("Error decodificando token:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);

    const authToken = Cookies.get("authToken");

    if (authToken) {
      setUserFromToken(authToken);
    } else {
      setUser(null);
    }

    setLoading(false);
    setInitialized(true);
  }, []);

  // EVITA HYDRATION MISMATCH
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        error,
        login: async (email: string, password: string) => {
          try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${envVariables.API_URL}/users/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error ||
                  errorData.message ||
                  "Error de inicio de sesión"
              );
            }

            const data = await response.json();

            if (data.token) {
              Cookies.set("authToken", data.token, {
                expires: 7,
                sameSite: "lax",
              });

              setUserFromToken(data.token);
            } else if (data.user) {
              setUser(data.user);
            }
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Error de inicio de sesión"
            );
            throw err;
          } finally {
            setLoading(false);
          }
        },

        logout: async () => {
          try {
            setLoading(true);

            await fetch(`${envVariables.API_URL}/users/logout`, {
              method: "POST",
              credentials: "include",
            }).catch(() =>
              console.warn("Sesión expirada en servidor")
            );

            Cookies.remove("authToken");
            setUser(null);
          } catch (err) {
            console.error("Error al cerrar sesión:", err);
          } finally {
            setLoading(false);
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}