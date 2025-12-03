import axios from 'axios';
import { API_BASE_URL } from '../types/constants';
import { ApiResponse } from '../types/api';

// Types
export interface RecommendedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  score?: number;
  reason?: string;
}

export interface RecommendationRequest {
  userId: string;
  itemId?: string;
  category?: string;
  limit?: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Recommendation APIs
export const getPersonalizedRecommendations = async (
  userId: string,
  limit: number = 10
): Promise<ApiResponse<RecommendedItem[]>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/personalized?userId=${userId}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get personalized recommendations error:', error);
    throw error;
  }
};

export const getSimilarItems = async (
  itemId: string,
  limit: number = 10
): Promise<ApiResponse<RecommendedItem[]>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/similar/${itemId}?limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get similar items error:', error);
    throw error;
  }
};

export const getCategoryRecommendations = async (
  category: string,
  userId?: string,
  limit: number = 10
): Promise<ApiResponse<RecommendedItem[]>> => {
  try {
    const params = new URLSearchParams({
      category,
      limit: limit.toString(),
      ...(userId && { userId }),
    });

    const response = await axios.get(
      `${API_BASE_URL}/recommendations/category?${params}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get category recommendations error:', error);
    throw error;
  }
};

export const getTrendingItems = async (
  limit: number = 10,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<ApiResponse<RecommendedItem[]>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/recommendations/trending?limit=${limit}&period=${period}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get trending items error:', error);
    throw error;
  }
};

export const getNewArrivals = async (
  limit: number = 10,
  category?: string
): Promise<ApiResponse<RecommendedItem[]>> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(category && { category }),
    });

    const response = await axios.get(
      `${API_BASE_URL}/recommendations/new-arrivals?${params}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get new arrivals error:', error);
    throw error;
  }
};

export const recordItemView = async (
  userId: string,
  itemId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/recommendations/view`,
      { userId, itemId },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Record item view error:', error);
    // Don't throw error for tracking, just log it
    return { status: 500, message: 'Failed to record view', data: undefined };
  }
};

export const recordItemInteraction = async (
  userId: string,
  itemId: string,
  interactionType: 'VIEW' | 'LIKE' | 'SHARE' | 'CONTACT'
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/recommendations/interaction`,
      { userId, itemId, interactionType },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Record interaction error:', error);
    return { status: 500, message: 'Failed to record interaction', data: undefined };
  }
};

// Utility functions
export const getRecommendationReason = (reason?: string): string => {
  if (!reason) return 'Đề xuất cho bạn';

  const reasonMap: { [key: string]: string } = {
    'SIMILAR_CATEGORY': 'Cùng danh mục với sản phẩm bạn đã xem',
    'SIMILAR_PRICE': 'Mức giá phù hợp với bạn',
    'POPULAR': 'Sản phẩm phổ biến',
    'NEW': 'Sản phẩm mới',
    'TRENDING': 'Đang thịnh hành',
    'USER_PREFERENCE': 'Dựa trên sở thích của bạn',
    'COLLABORATIVE': 'Người dùng khác cũng thích',
  };

  return reasonMap[reason] || reason;
};
