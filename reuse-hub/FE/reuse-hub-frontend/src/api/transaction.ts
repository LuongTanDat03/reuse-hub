import axios from 'axios';
import { ApiResponse, CreateTransactionRequest, SubmitRatingRequest, TransactionResponse, TransactionStatus } from '../types/api';
import { API_BASE_URL } from '../types/constants';

const TRANSACTION_API_BASE_URL = `${API_BASE_URL}/transactions`;

const getAuthHeaders = (userId: string) => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-User-Id': userId,
  };
};

export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const getMyTransactions = async (
  userId: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
): Promise<ApiResponse<PageResponse<TransactionResponse>>> => {
  const response = await axios.get<ApiResponse<PageResponse<TransactionResponse>>>(
    `${TRANSACTION_API_BASE_URL}/user`,
    {
      params: { page, size, sortBy, sortDirection },
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const getBuyerTransactions = async (
  userId: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
): Promise<ApiResponse<PageResponse<TransactionResponse>>> => {
  const response = await axios.get<ApiResponse<PageResponse<TransactionResponse>>>(
    `${TRANSACTION_API_BASE_URL}/buyer`,
    {
      params: { page, size, sortBy, sortDirection },
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const getSellerTransactions = async (
  userId: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
): Promise<ApiResponse<PageResponse<TransactionResponse>>> => {
  const response = await axios.get<ApiResponse<PageResponse<TransactionResponse>>>(
    `${TRANSACTION_API_BASE_URL}/seller`,
    {
      params: { page, size, sortBy, sortDirection },
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const getItemTransactions = async (
  userId: string,
  itemId: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDirection: string = 'desc'
): Promise<ApiResponse<PageResponse<TransactionResponse>>> => {
  const response = await axios.get<ApiResponse<PageResponse<TransactionResponse>>>(
    `${TRANSACTION_API_BASE_URL}/item/${itemId}`,
    {
      params: { page, size, sortBy, sortDirection },
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const getTransaction = async (
  userId: string,
  transactionId: string
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.get<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}`,
    {
      headers: getAuthHeaders(userId),
    }
  );
  return response.data;
};

export const createTransaction = async (
  buyerUserId: string,
  request: CreateTransactionRequest
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}`,
    request,
    {
      headers: getAuthHeaders(buyerUserId),
    }
  );
  return response.data;
};

export const confirmDelivery = async (
  sellerUserId: string,
  transactionId: string,
  trackingCode: string
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/confirm-delivery`,
    trackingCode,
    {
      headers: {
        ...getAuthHeaders(sellerUserId),
        'Content-Type': 'text/plain',
      },
    }
  );
  return response.data;
};

export const completeTransaction = async (
  buyerUserId: string,
  transactionId: string
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/complete`,
    {},
    {
      headers: getAuthHeaders(buyerUserId),
    }
  );
  return response.data;
};

export const cancelTransaction = async (
  userId: string,
  transactionId: string,
  reason: string
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/cancel`,
    reason,
    {
      headers: {
        ...getAuthHeaders(userId),
        'Content-Type': 'text/plain',
      },
    }
  );
  return response.data;
};

export const submitFeedback = async (
  buyerUserId: string,
  transactionId: string,
  request: SubmitRatingRequest
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/feedback`,
    request,
    {
      headers: getAuthHeaders(buyerUserId),
    }
  );
  return response.data;
};

export const updateTransactionStatus = async (
  adminUserId: string,
  transactionId: string,
  status: TransactionStatus
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.put<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/status`,
    status,
    {
      headers: {
        ...getAuthHeaders(adminUserId),
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};



export const acceptTransaction = async (
  sellerUserId: string,
  transactionId: string
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/accept`,
    {},
    {
      headers: getAuthHeaders(sellerUserId),
    }
  );
  return response.data;
};

export const rejectTransaction = async (
  sellerUserId: string,
  transactionId: string,
  reason: string
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/reject`,
    reason,
    {
      headers: {
        ...getAuthHeaders(sellerUserId),
        'Content-Type': 'text/plain',
      },
    }
  );
  return response.data;
};

export const rateTransaction = async (
  buyerUserId: string,
  transactionId: string,
  request: SubmitRatingRequest
): Promise<ApiResponse<TransactionResponse>> => {
  const response = await axios.post<ApiResponse<TransactionResponse>>(
    `${TRANSACTION_API_BASE_URL}/${transactionId}/feedback`,
    request,
    {
      headers: getAuthHeaders(buyerUserId),
    }
  );
  return response.data;
};
