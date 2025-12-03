import axios from 'axios';
import { ApiResponse, ProfileResponse, ProfileUpdateRequest } from '../types/api';
import { API_BASE_URL, API_ENDPOINTS } from '../types/constants';

const PROFILE_API_BASE_URL = `${API_BASE_URL}${API_ENDPOINTS.PROFILE}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getProfile = async (userId: string): Promise<ApiResponse<ProfileResponse>> => {
  const response = await axios.get<ApiResponse<ProfileResponse>>(
    `${PROFILE_API_BASE_URL}/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateProfile = async (userId: string, request: ProfileUpdateRequest, file?: File): Promise<ApiResponse<ProfileResponse>> => {
  const formData = new FormData();
  // Wrap JSON as Blob to set correct part content-type
  const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
  formData.append('request', jsonBlob);
  if (file) {
    formData.append('file', file);
  }

  const response = await axios.put<ApiResponse<ProfileResponse>>(
    `${PROFILE_API_BASE_URL}/update`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        // Không set Content-Type để axios tự thêm boundary đúng chuẩn
      },
    }
  );
  return response.data;
};



// Social Features
export const followUser = async (currentUserId: string, targetUserId: string): Promise<ApiResponse<void>> => {
  const response = await axios.post<ApiResponse<void>>(
    `${PROFILE_API_BASE_URL}/${targetUserId}/follow`,
    {},
    {
      headers: {
        ...getAuthHeaders(),
        'X-User-Id': currentUserId,
      },
    }
  );
  return response.data;
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<ApiResponse<void>> => {
  const response = await axios.delete<ApiResponse<void>>(
    `${PROFILE_API_BASE_URL}/${targetUserId}/follow`,
    {
      headers: {
        ...getAuthHeaders(),
        'X-User-Id': currentUserId,
      },
    }
  );
  return response.data;
};

export const getFollowers = async (userId: string, page: number = 0, size: number = 20): Promise<ApiResponse<any>> => {
  const response = await axios.get<ApiResponse<any>>(
    `${PROFILE_API_BASE_URL}/${userId}/followers?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getFollowing = async (userId: string, page: number = 0, size: number = 20): Promise<ApiResponse<any>> => {
  const response = await axios.get<ApiResponse<any>>(
    `${PROFILE_API_BASE_URL}/${userId}/following?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getUserItems = async (userId: string, page: number = 0, size: number = 10, status?: string): Promise<ApiResponse<any>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    ...(status && { status }),
  });
  
  const response = await axios.get<ApiResponse<any>>(
    `${PROFILE_API_BASE_URL}/${userId}/items?${params}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getUserReviews = async (userId: string, page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
  const response = await axios.get<ApiResponse<any>>(
    `${PROFILE_API_BASE_URL}/${userId}/reviews?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<ApiResponse<{ following: boolean }>> => {
  const response = await axios.get<ApiResponse<{ following: boolean }>>(
    `${PROFILE_API_BASE_URL}/${targetUserId}/is-following`,
    {
      headers: {
        ...getAuthHeaders(),
        'X-User-Id': currentUserId,
      },
    }
  );
  return response.data;
};
