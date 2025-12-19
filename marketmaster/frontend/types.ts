// frontend/types.ts

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export enum OrderStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  active: boolean;
  created_at: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  username?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  transaction_ref: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  created_at: string;
  gateway_ref: string;
}

export interface Card {
  id: string;
  last_four: string;
  card_holder_name: string;
  expiry_month: string;
  expiry_year: string;
  card_brand: string;
  is_default: boolean;
  created_at: string;
}

export interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalAdmins: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  activeProducts: number;
  recentRegistrations: number;
  recentOrders: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
