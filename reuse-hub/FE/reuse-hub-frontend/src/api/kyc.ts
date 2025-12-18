import axios from 'axios';
import { ApiResponse } from '../types/api';
import {
  KycResponse,
  KycPage,
  KycSubmitRequest,
  KycReviewRequest,
  KycStatus,
} from '../types/kyc';
import { API_BASE_URL } from '../types/constants';

const KYC_API_BASE_URL = `${API_BASE_URL}/profile/kyc`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// =================================================================
// USER ENDPOINTS
// =================================================================

export const submitKyc = async (
  userId: string,
  request: KycSubmitRequest,
  frontImage: File,
  backImage?: File,
  selfieImage?: File
): Promise<ApiResponse<KycResponse>> => {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  formData.append('frontImage', frontImage);
  if (backImage) {
    formData.append('backImage', backImage);
  }
  if (selfieImage) {
    formData.append('selfieImage', selfieImage);
  }

  const response = await axios.post<ApiResponse<KycResponse>>(
    `${KYC_API_BASE_URL}/submit/${userId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getMyKyc = async (userId: string): Promise<ApiResponse<KycResponse>> => {
  const response = await axios.get<ApiResponse<KycResponse>>(
    `${KYC_API_BASE_URL}/my/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const resubmitKyc = async (
  userId: string,
  request: KycSubmitRequest,
  frontImage?: File,
  backImage?: File,
  selfieImage?: File
): Promise<ApiResponse<KycResponse>> => {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  if (frontImage) {
    formData.append('frontImage', frontImage);
  }
  if (backImage) {
    formData.append('backImage', backImage);
  }
  if (selfieImage) {
    formData.append('selfieImage', selfieImage);
  }

  const response = await axios.put<ApiResponse<KycResponse>>(
    `${KYC_API_BASE_URL}/resubmit/${userId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const isUserVerified = async (userId: string): Promise<ApiResponse<boolean>> => {
  const response = await axios.get<ApiResponse<boolean>>(
    `${KYC_API_BASE_URL}/verified/${userId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// =================================================================
// ADMIN ENDPOINTS
// =================================================================

export const getPendingKyc = async (
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<KycPage>> => {
  const response = await axios.get<ApiResponse<KycPage>>(
    `${KYC_API_BASE_URL}/admin/pending`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

export const getAllKyc = async (
  status?: KycStatus,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<KycPage>> => {
  const response = await axios.get<ApiResponse<KycPage>>(
    `${KYC_API_BASE_URL}/admin/all`,
    {
      headers: getAuthHeaders(),
      params: { status, pageNo, pageSize },
    }
  );
  return response.data;
};

export const getKycById = async (kycId: string): Promise<ApiResponse<KycResponse>> => {
  const response = await axios.get<ApiResponse<KycResponse>>(
    `${KYC_API_BASE_URL}/admin/${kycId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const reviewKyc = async (
  kycId: string,
  adminId: string,
  request: KycReviewRequest
): Promise<ApiResponse<KycResponse>> => {
  const response = await axios.put<ApiResponse<KycResponse>>(
    `${KYC_API_BASE_URL}/admin/${kycId}/review/${adminId}`,
    request,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const countPendingKyc = async (): Promise<ApiResponse<number>> => {
  const response = await axios.get<ApiResponse<number>>(
    `${KYC_API_BASE_URL}/admin/count/pending`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
