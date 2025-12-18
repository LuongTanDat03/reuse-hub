import axios from 'axios';
import { ApiResponse } from '../types/api';
import {
  AuctionResponse,
  AuctionPage,
  BidResponse,
  BidPage,
  CreateAuctionRequest,
  PlaceBidRequest,
} from '../types/auction';
import { API_BASE_URL } from '../types/constants';

const AUCTION_API_BASE_URL = `${API_BASE_URL}/auction/auctions`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// =================================================================
// AUCTION CRUD
// =================================================================

export const createAuction = async (
  sellerId: string,
  request: CreateAuctionRequest,
  images?: File[]
): Promise<ApiResponse<AuctionResponse>> => {
  const formData = new FormData();
  
  const requestBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
  formData.append('request', requestBlob);
  
  if (images) {
    images.forEach((image) => formData.append('images', image));
  }

  const response = await axios.post<ApiResponse<AuctionResponse>>(
    `${AUCTION_API_BASE_URL}/create/${sellerId}`,
    formData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getAuctionById = async (
  auctionId: string,
  currentUserId?: string
): Promise<ApiResponse<AuctionResponse>> => {
  const response = await axios.get<ApiResponse<AuctionResponse>>(
    `${AUCTION_API_BASE_URL}/${auctionId}`,
    {
      headers: getAuthHeaders(),
      params: { currentUserId },
    }
  );
  return response.data;
};

export const cancelAuction = async (
  auctionId: string,
  sellerId: string
): Promise<ApiResponse<void>> => {
  const response = await axios.delete<ApiResponse<void>>(
    `${AUCTION_API_BASE_URL}/${auctionId}/cancel/${sellerId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// =================================================================
// BIDDING
// =================================================================

export const placeBid = async (
  auctionId: string,
  bidderId: string,
  request: PlaceBidRequest
): Promise<ApiResponse<BidResponse>> => {
  const response = await axios.post<ApiResponse<BidResponse>>(
    `${AUCTION_API_BASE_URL}/${auctionId}/bid/${bidderId}`,
    request,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const buyNow = async (
  auctionId: string,
  buyerId: string
): Promise<ApiResponse<AuctionResponse>> => {
  const response = await axios.post<ApiResponse<AuctionResponse>>(
    `${AUCTION_API_BASE_URL}/${auctionId}/buy-now/${buyerId}`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// =================================================================
// LISTING
// =================================================================

export const getActiveAuctions = async (
  pageNo = 0,
  pageSize = 10,
  sortBy = 'createdAt',
  sortDirection = 'desc'
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/active`,
    {
      params: { pageNo, pageSize, sortBy, sortDirection },
    }
  );
  return response.data;
};

export const getAuctionsEndingSoon = async (
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/ending-soon`,
    { params: { pageNo, pageSize } }
  );
  return response.data;
};

export const getHotAuctions = async (
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/hot`,
    { params: { pageNo, pageSize } }
  );
  return response.data;
};

export const searchAuctions = async (
  keyword: string,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/search`,
    { params: { keyword, pageNo, pageSize } }
  );
  return response.data;
};

export const getAuctionsBySeller = async (
  sellerId: string,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/seller/${sellerId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

export const getMyBiddingAuctions = async (
  userId: string,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/my-bids/${userId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

export const getWonAuctions = async (
  userId: string,
  pageNo = 0,
  pageSize = 10
): Promise<ApiResponse<AuctionPage>> => {
  const response = await axios.get<ApiResponse<AuctionPage>>(
    `${AUCTION_API_BASE_URL}/won/${userId}`,
    {
      headers: getAuthHeaders(),
      params: { pageNo, pageSize },
    }
  );
  return response.data;
};

export const getAuctionBids = async (
  auctionId: string,
  pageNo = 0,
  pageSize = 20
): Promise<ApiResponse<BidPage>> => {
  const response = await axios.get<ApiResponse<BidPage>>(
    `${AUCTION_API_BASE_URL}/${auctionId}/bids`,
    { params: { pageNo, pageSize } }
  );
  return response.data;
};

// =================================================================
// UTILITIES
// =================================================================

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return 'Đã kết thúc';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const getAuctionStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ bắt đầu',
    ACTIVE: 'Đang diễn ra',
    ENDED: 'Đã kết thúc',
    SOLD: 'Đã bán',
    CANCELLED: 'Đã hủy',
    NO_BIDS: 'Không có ai đấu giá',
  };
  return statusMap[status] || status;
};

export const getAuctionStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    ENDED: 'bg-gray-100 text-gray-800',
    SOLD: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_BIDS: 'bg-orange-100 text-orange-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};
