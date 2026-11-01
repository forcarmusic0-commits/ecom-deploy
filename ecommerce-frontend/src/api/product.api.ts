import api from "./axios";
import { ApiResponse, Product, Review } from "@/types";

export interface ProductQuery {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "rating";
  page?: number;
  limit?: number;
}

export const getProductsApi = (query: ProductQuery = {}) =>
  api.get<ApiResponse<{ products: Product[] }>>("/products", { params: query });

export const getProductByIdApi = (id: string) =>
  api.get<ApiResponse<{ product: Product }>>(`/products/${id}`);

export const createProductApi = (payload: Partial<Product>) =>
  api.post<ApiResponse<{ product: Product }>>("/products", payload);

export const updateProductApi = (id: string, payload: Partial<Product>) =>
  api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, payload);

export const deleteProductApi = (id: string) =>
  api.delete<ApiResponse<null>>(`/products/${id}`);

export const addReviewApi = (productId: string, rating: number, comment: string) =>
  api.post<ApiResponse<{ review: Review }>>(`/products/${productId}/reviews`, { rating, comment });
