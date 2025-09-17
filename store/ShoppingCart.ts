import { SupplierDAO } from "@/types/Api";
import { create } from "zustand";

type Product = {
  id: string;
  name: string;
  salePrice: number;
  purchasePrice: number;
  quantity: number;
  tax: number;
  supplier: SupplierDAO;
  tenantId: string;
  stock: number;
};

type CartState = {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateProduct: (updatedProduct: Product) => void;
};

export const useShoppingCart = create<CartState>((set) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => {
      const existingProduct = state.cart.find((p) => p.id === product.id);
      if (existingProduct) {
        return {
          cart: state.cart.map((p) =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
          ),
        };
      }
      console.log("Producto añadido:", product);
      console.log("Estado actual del carrito:", [...state.cart, product]);
      return { cart: [...state.cart, { ...product }] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((product) => (product.id) !== id),
    })),
    
  clearCart: () => set({ cart: [] }),

  updateProduct: (updatedProduct) =>
    set((state) => ({
      cart: state.cart.map((product) =>
        product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
      ),
    })),
}));
