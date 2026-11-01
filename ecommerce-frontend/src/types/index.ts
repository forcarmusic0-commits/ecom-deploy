// ---- Shared API envelope (matches sendResponse() on the backend) ----
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export type Role = "user" | "seller" | "admin";

export interface Address {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  wishlist: Product[] | string[];
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: Category | string | null;
  image?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: Category | string;
  seller: Pick<User, "_id" | "name" | "avatar"> | string;
  ratings: number;
  numReviews: number;
  reviews: Review[] | string[];
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: Pick<User, "_id" | "name" | "avatar"> | string;
  product: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface OrderItem {
  product: Product | string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  _id: string;
  user: Pick<User, "_id" | "name" | "email"> | string;
  orderItems: OrderItem[];
  shippingAddress: Omit<Address, "label" | "_id">;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: OrderStatus;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

// ---- Chat (MySQL-backed) ----
export interface ChatRoom {
  id: number;
  buyerId: string;
  sellerId: string;
  productId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  messages?: Message[];
}

export interface Message {
  id: number;
  roomId: number;
  senderId: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

// ---- Admin dashboard ----
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}
