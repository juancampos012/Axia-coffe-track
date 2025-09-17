"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

type BalanceContextType = {
  balance: number | null;
  setBalance: (balance: number | null) => void;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number | null>(null);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
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
