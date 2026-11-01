import api from "./axios";
import { ApiResponse, DashboardStats, User, Role } from "@/types";

export const getDashboardStatsApi = () =>
  api.get<ApiResponse<DashboardStats>>("/admin/dashboard");

export const getAllUsersApi = () => api.get<ApiResponse<{ users: User[] }>>("/admin/users");

export const updateUserRoleApi = (id: string, role: Role) =>
  api.put<ApiResponse<{ user: User }>>(`/admin/users/${id}/role`, { role });

export const toggleUserActiveApi = (id: string) =>
  api.put<ApiResponse<{ user: User }>>(`/admin/users/${id}/deactivate`);

export const deleteAnyProductApi = (id: string) =>
  api.delete<ApiResponse<null>>(`/admin/products/${id}`);
