'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BalanceContextType = {
  balance: number | null;
  setBalance: (balance: number | null) => void;
  refreshBalance: (tenantId: string) => Promise<void>;
  isVisible: boolean;
  toggleVisibility: () => void;
  displayBalance: string;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  /** Recarga el balance desde la API sin recargar la página */
  const refreshBalance = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    try {
      const res = await fetch(`${API_URL}/companies/${tenantId}`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const company = await res.json();
      if (company?.currentBalance !== undefined) {
        setBalance(Number(company.currentBalance));
      }
    } catch {
      // silencioso — no rompemos la UI si falla
    }
  }, []);

  const displayBalance = isVisible
    ? (balance !== null
        ? `$ ${Number(balance).toLocaleString('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`
        : '$ 0')
    : '••••••';

  return (
    <BalanceContext.Provider value={{ balance, setBalance, refreshBalance, isVisible, toggleVisibility, displayBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance debe usarse dentro de BalanceProvider');
  }
  return context;
};
