import api from "./axios";
import { ApiResponse, Category } from "@/types";

export const getCategoriesApi = () => api.get<ApiResponse<{ categories: Category[] }>>("/categories");

export const createCategoryApi = (payload: Partial<Category>) =>
  api.post<ApiResponse<{ category: Category }>>("/categories", payload);

export const updateCategoryApi = (id: string, payload: Partial<Category>) =>
  api.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, payload);

export const deleteCategoryApi = (id: string) =>
  api.delete<ApiResponse<null>>(`/categories/${id}`);
