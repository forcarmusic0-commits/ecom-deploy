import api from "./axios";
import { ApiResponse, User } from "@/types";

export interface AuthPayload {
  user: User;
  accessToken: string;
}

export const registerApi = (name: string, email: string, password: string) =>
  api.post<ApiResponse<AuthPayload>>("/auth/register", { name, email, password });

export const loginApi = (email: string, password: string) =>
  api.post<ApiResponse<AuthPayload>>("/auth/login", { email, password });

export const refreshApi = () =>
  api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");

export const logoutApi = () => api.post<ApiResponse<null>>("/auth/logout");

export const getMeApi = () => api.get<ApiResponse<{ user: User }>>("/auth/me");

// Google OAuth is a full browser redirect, not an axios call
export const googleLoginUrl = () =>
  `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`;
