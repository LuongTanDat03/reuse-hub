import axios from 'axios';
import { ApiResponse } from '../types/api';
import { API_BASE_URL, API_ENDPOINTS } from '../types/constants';

const PAYMENT_API_BASE_URL = `${API_BASE_URL}${API_ENDPOINTS.PAYMENTS}`;

const getAuthHeaders = (userId: string) => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-User-Id': userId,
  };
};

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  linkedItemId?: string;
  linkedTransactionId?: string;
  paymentMethod?: string;
}

export interface PaymentResponse {
  clientSecret: string;
  paymentId: string;
}

export const createPaymentIntent = async (
  userId: string,
  request: CreatePaymentRequest
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await axios.post<ApiResponse<PaymentResponse>>(
    `${PAYMENT_API_BASE_URL}/create-intent`,
    request,
    {
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const getPaymentById = async (
  userId: string,
  paymentId: string
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await axios.get<ApiResponse<PaymentResponse>>(
    `${PAYMENT_API_BASE_URL}/${paymentId}`,
    {
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const getPaymentByTransactionId = async (
  userId: string,
  transactionId: string
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await axios.get<ApiResponse<PaymentResponse>>(
    `${PAYMENT_API_BASE_URL}/transaction/${transactionId}`,
    {
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const syncPaymentStatus = async (
  userId: string,
  paymentId: string
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await axios.post<ApiResponse<PaymentResponse>>(
    `${PAYMENT_API_BASE_URL}/${paymentId}/sync-status`,
    {},
    {
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};
