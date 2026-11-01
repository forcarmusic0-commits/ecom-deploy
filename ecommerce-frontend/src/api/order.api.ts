import api from "./axios";
import { ApiResponse, Order, Address } from "@/types";

export const createOrderApi = (
  shippingAddress: Omit<Address, "label" | "_id">,
  paymentMethod: string
) => api.post<ApiResponse<{ order: Order }>>("/orders", { shippingAddress, paymentMethod });

export const getMyOrdersApi = () => api.get<ApiResponse<{ orders: Order[] }>>("/orders/my");

export const getOrderByIdApi = (id: string) =>
  api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);

export const payOrderApi = (id: string) =>
  api.put<ApiResponse<{ order: Order }>>(`/orders/${id}/pay`);

export const getAllOrdersApi = () => api.get<ApiResponse<{ orders: Order[] }>>("/orders");

export const deliverOrderApi = (id: string) =>
  api.put<ApiResponse<{ order: Order }>>(`/orders/${id}/deliver`);
