import api from "./axios";
import { ApiResponse, User, Address } from "@/types";

export const getProfileApi = () => api.get<ApiResponse<{ user: User }>>("/users/profile");

export const updateProfileApi = (payload: {
  name?: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
}) => api.put<ApiResponse<{ user: User }>>("/users/profile", payload);

export const changePasswordApi = (currentPassword: string, newPassword: string) =>
  api.put<ApiResponse<null>>("/users/change-password", { currentPassword, newPassword });

export const addToWishlistApi = (productId: string) =>
  api.post<ApiResponse<{ wishlist: string[] }>>(`/users/wishlist/${productId}`);

export const removeFromWishlistApi = (productId: string) =>
  api.delete<ApiResponse<{ wishlist: string[] }>>(`/users/wishlist/${productId}`);
