import api from "./axios";
import { ApiResponse, Cart } from "@/types";

export const getCartApi = () => api.get<ApiResponse<{ cart: Cart }>>("/cart");

export const addToCartApi = (productId: string, quantity = 1) =>
  api.post<ApiResponse<{ cart: Cart }>>("/cart", { productId, quantity });

export const updateCartItemApi = (productId: string, quantity: number) =>
  api.put<ApiResponse<{ cart: Cart }>>(`/cart/${productId}`, { quantity });

export const removeFromCartApi = (productId: string) =>
  api.delete<ApiResponse<{ cart: Cart }>>(`/cart/${productId}`);

export const clearCartApi = () => api.delete<ApiResponse<null>>("/cart");
