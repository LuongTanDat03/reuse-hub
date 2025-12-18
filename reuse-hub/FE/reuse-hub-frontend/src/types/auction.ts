// Auction Types

export type AuctionStatus = 'PENDING' | 'ACTIVE' | 'ENDED' | 'SOLD' | 'CANCELLED' | 'NO_BIDS';
export type BidStatus = 'ACTIVE' | 'OUTBID' | 'WON' | 'CANCELLED';

export interface AuctionResponse {
  id: string;
  itemId?: string;
  sellerId: string;
  sellerName?: string;
  sellerAvatar?: string;
  title: string;
  description?: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  bidIncrement: number;
  buyNowPrice?: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  bidCount: number;
  uniqueBidders?: number;
  winnerId?: string;
  winnerName?: string;
  categoryId?: string;
  categoryName?: string;
  address?: string;
  timeRemaining: number; // seconds
  isUserHighestBidder?: boolean;
  userHighestBid?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidResponse {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName?: string;
  bidderAvatar?: string;
  amount: number;
  status: BidStatus;
  isAutoBid?: boolean;
  createdAt: string;
}

export interface CreateAuctionRequest {
  itemId?: string;
  title: string;
  description?: string;
  images?: string[];
  startingPrice: number;
  bidIncrement: number;
  buyNowPrice?: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  categoryId?: string;
  address?: string;
}

export interface PlaceBidRequest {
  amount: number;
  maxAutoBid?: number;
}

export interface AuctionPage {
  content: AuctionResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface BidPage {
  content: BidResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// WebSocket message types
export interface AuctionWebSocketMessage {
  type: 'NEW_BID' | 'BID_ERROR' | 'AUCTION_ENDED' | 'OUTBID';
  auctionId: string;
  bid?: BidResponse;
  message?: string;
  error?: string;
}
