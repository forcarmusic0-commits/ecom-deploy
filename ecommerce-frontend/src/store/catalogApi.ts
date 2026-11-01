import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ProductQuery } from "@/api/product.api";
import { ApiResponse, Category, Product } from "@/types";

export interface ProductList {
  products: Product[];
  pagination?: ApiResponse<unknown>["pagination"];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),
  tagTypes: ["Product", "Category"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductList, ProductQuery>({
      query: (params) => ({ url: "/products", params }),
      transformResponse: (response: ApiResponse<{ products: Product[] }>) => ({
        products: response.data.products,
        pagination: response.pagination,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((product) => ({ type: "Product" as const, id: product._id })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ApiResponse<{ product: Product }>) => response.data.product,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
      transformResponse: (response: ApiResponse<{ categories: Category[] }>) =>
        response.data.categories,
      providesTags: [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery, useGetCategoriesQuery } = catalogApi;
