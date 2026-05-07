'use client'; 

import React, { createContext, useState, useContext, ReactNode } from 'react';

type BalanceContextType = {
  balance: number | null;
  setBalance: (balance: number | null) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  displayBalance: string;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const displayBalance = isVisible 
    ? (balance !== null 
        ? `$ ${Number(balance).toLocaleString('es-CO', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          })}` 
        : "$ 0") 
    : "••••••";

  return (
    <BalanceContext.Provider value={{ balance, setBalance, isVisible, toggleVisibility, displayBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    // Si entras aquí, es porque el componente que llama a useBalance 
    // no tiene un <BalanceProvider> por encima en el árbol de React.
    throw new Error('useBalance debe usarse dentro de BalanceProvider');
  }
  return context;
};