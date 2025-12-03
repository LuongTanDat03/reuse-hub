import axios from 'axios';
import { API_BASE_URL } from '../types/constants';

const ADMIN_API_BASE_URL = `${API_BASE_URL}/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface UserStatistics {
  totalUsers: number;
  userStats: Record<string, number>;
}

export interface ItemStatistics {
  totalItems: number;
  itemStats: Record<string, number>;
}

export interface TransactionStatistics {
  totalTransactions: number;
  transactionStats: Record<string, number>;
}

export interface InfoUser {
  id: string;
  phone: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  address: any[];
}

export interface ItemResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  address: string;
  location: any;
  status: string;
  price: number;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  category: string;
  categorySlug: string;
}

export interface TransactionResponse {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImageUrl: string;
  itemPrice: number;
  buyerId: string;
  sellerId: string;
  status: string;
  type: string;
  quantity: number;
  totalPrice: number;
  deliveryMethod: string;
  deliveryDate: string;
  deliveryAddress: string;
  deliveryPhone: string;
  completedAt: string;
  cancelledAt: string;
  expiresAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardUserResponse {
  users: PageResponse<InfoUser>;
  statistics: UserStatistics;
}

export interface DashboardItemResponse {
  items: PageResponse<ItemResponse>;
  statistics: ItemStatistics;
}

export interface DashboardTransactionResponse {
  transactions: PageResponse<TransactionResponse>;
  statistics: TransactionStatistics;
}

// Get all users with pagination
export const getAllUsers = async (
  pageNo: number = 0,
  pageSize: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
) => {
  return axios.get<{ status: number; message: string; data: DashboardUserResponse }>(
    `${ADMIN_API_BASE_URL}/users`,
    {
      params: { pageNo, pageSize, sortBy, sortDirection },
      headers: getAuthHeaders(),
    }
  );
};

// Get all items with pagination
export const getAllItems = async (
  pageNo: number = 0,
  pageSize: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc',
  filter?: string
) => {
  return axios.get<{ status: number; message: string; data: DashboardItemResponse }>(
    `${ADMIN_API_BASE_URL}/items`,
    {
      params: { pageNo, pageSize, sortBy, sortDirection, filter },
      headers: getAuthHeaders(),
    }
  );
};

// Get all transactions with pagination
export const getAllTransactions = async (
  pageNo: number = 0,
  pageSize: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
) => {
  return axios.get<{ status: number; message: string; data: DashboardTransactionResponse }>(
    `${ADMIN_API_BASE_URL}/transactions`,
    {
      params: { pageNo, pageSize, sortBy, sortDirection },
      headers: getAuthHeaders(),
    }
  );
};

// Block user
export const blockUser = async (userId: string) => {
  return axios.put(
    `${ADMIN_API_BASE_URL}/users/${userId}/block`,
    {},
    { headers: getAuthHeaders() }
  );
};

// Unblock user
export const unblockUser = async (userId: string) => {
  return axios.put(
    `${ADMIN_API_BASE_URL}/users/${userId}/unblock`,
    {},
    { headers: getAuthHeaders() }
  );
};

// Reset user password
export const resetPassword = async (userId: string) => {
  return axios.put(
    `${ADMIN_API_BASE_URL}/users/${userId}/reset-password`,
    {},
    { headers: getAuthHeaders() }
  );
};

// Delete item
export const deleteItem = async (itemId: string) => {
  return axios.delete(
    `${ADMIN_API_BASE_URL}/items/${itemId}`,
    { headers: getAuthHeaders() }
  );
};
