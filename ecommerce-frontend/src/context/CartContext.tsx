import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Cart } from "@/types";
import { useAuth } from "./AuthContext";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
} from "@/api/cart.api";

interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await getCartApi();
      setCart(data.data.cart);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // whenever the logged-in user changes (login/logout), reload the cart
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, quantity = 1) => {
    const { data } = await addToCartApi(productId, quantity);
    setCart(data.data.cart);
  };

  const updateItem = async (productId: string, quantity: number) => {
    const { data } = await updateCartItemApi(productId, quantity);
    setCart(data.data.cart);
  };

  const removeItem = async (productId: string) => {
    const { data } = await removeFromCartApi(productId);
    setCart(data.data.cart);
  };

  const clear = async () => {
    await clearCartApi();
    setCart((prev) => (prev ? { ...prev, items: [] } : prev));
  };

  const itemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, itemCount, isLoading, refreshCart, addItem, updateItem, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
