import { create } from "zustand";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  tax: number;
  salePrice: number;
  purchasePrice: number;
  tenantId: string;
  supplier?: any;
  stock: number;
};

type ShoppingCartStore = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantityInCart: (id: string, quantity: number) => void;
  setCart: (items: CartItem[]) => void;
};

export const useShoppingCart = create<ShoppingCartStore>((set) => ({
  cart: [],

  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  clearCart: () => set({ cart: [] }),

  updateQuantityInCart: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  setCart: (items) => set({ cart: items }),
}));
