import { create } from "zustand";

interface UserState {
  role: string | null;
  tenantId: string | null; // <-- Añadimos esto
  setRole: (role: string | null) => void;
  setTenantId: (id: string | null) => void; // <-- Y su setter
}

export const useUserStore = create<UserState>((set) => ({
  role: null,
  tenantId: null, // Estado inicial
  setRole: (role) => set({ role }),
  setTenantId: (id) => set({ tenantId: id }),
}));