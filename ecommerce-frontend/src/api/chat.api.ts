import api from "./axios";
import { ApiResponse, ChatRoom } from "@/types";

export const getOrCreateRoomApi = (sellerId: string, productId?: string) =>
  api.post<ApiResponse<{ room: ChatRoom }>>("/chat/rooms", { sellerId, productId });

export const getMyRoomsApi = () => api.get<ApiResponse<{ rooms: ChatRoom[] }>>("/chat/rooms");

export const getRoomMessagesApi = (roomId: number) =>
  api.get<ApiResponse<{ room: ChatRoom }>>(`/chat/rooms/${roomId}/messages`);
