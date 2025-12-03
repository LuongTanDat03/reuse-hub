// =================================================================
// GENERIC API RESPONSE
// =================================================================
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

// =================================================================
// AUTHENTICATION
// =================================================================

// -> POST /identity/auth/register
export interface UserCreationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  gender: 'MALE' | 'FEMALE';
  username: string;
  password: string;
  address: Address[];
}

export interface Address {
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  country: string;
}

// <- POST /identity/auth/register (SUCCESS RESPONSE)
// Based on the JSON you provided
export interface UserCreationResponse {
  id: string; // This is the userId we need for the verification step
  phone: string;
  email: string;
  username: string;
  password?: string | null;
  userRoles?: any | null;
}

// -> POST /identity/auth/login
export interface SignInRequest {
  usernameOrEmail: string;
  password: string;
}

// <- POST /identity/auth/login (SUCCESS RESPONSE)
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  usernameOrEmail: string;
}

// -> POST /identity/auth/confirm (as query params)
// userId: string
// verificationCode: string

// <- POST /identity/auth/confirm (SUCCESS RESPONSE)
export interface VerifyEmailResponse {
  id: string;
  phone: string;
  email: string;
  username: string;
  password?: string | null;
  userRoles?: UserHasRoleResponse[] | null;
}

export interface UserHasRoleResponse {
  userId: string;
  roleId: string;
}

// =================================================================
// USER & ERROR MODELS
// =================================================================
export interface ProfileResponse {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone: string;
  address?: Address | string;
  joinDate?: string;
  bio?: string;
  avatarUrl?: string;
  // Add other fields as per your backend ProfileResponse DTO
}

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: Address | string;
  bio?: string;
  // Add other fields that can be updated
}

export interface User {
  id: string;
  email: string;
  username: string;
  roles?: string[];
  status?: 'ACTIVE' | 'PENDING' | 'DISABLED';
}

export interface ApiError {
  timestamp: string;
  status: number;
  path: string;
  error: string;
  message: string;
}

// =================================================================
// ITEM SERVICE
// =================================================================

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Comment
export interface CommentResponse {
  id?: string;
  userId: string;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  categorySlug: string;
  address?: string;
  location: { latitude: number; longitude: number };
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  price: number;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  comments?: CommentResponse[];
  ratings?: RatingResponse[];
  isLiked?: boolean;  // Whether current user has liked this item (calculated in FE)
}

export interface RatingResponse {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ItemSummaryResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
  categorySlug: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  price: number;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isLiked?: boolean;  // Whether current user has liked this item (calculated in FE)
}

export interface ItemCreationRequest {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  address: string;
  location: { latitude: number; longitude: number };
}

export interface ItemSearchRequest {
  keyword: string;
}

export type ItemUpdateRequest = Partial<ItemCreationRequest>;

// =================================================================
// CHAT SERVICE
// =================================================================

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  SEEN = 'SEEN',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  EMOJI = 'EMOJI',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  STICKER = 'STICKER',
  GIF = 'GIF',
}

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  DISBAND = 'DISBAND',
  HIDE = 'HIDE',
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  media?: string[];
  status: MessageStatus;
  type?: MessageType;
  reactions?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  // Product fields
  itemId?: string;
  itemTitle?: string;
  itemThumbnail?: string;
  itemPrice?: number;
}

export interface SendMessageRequest {
  senderId: string;
  recipientId: string;
  content: string;
  // Product fields
  itemId?: string;
  itemTitle?: string;
  itemThumbnail?: string;
  itemPrice?: number;
}

export interface ConversationResponse {
  id: string;
  participantIds: string[];
  lastMessageId?: string;
  lastMessageTimestamp?: string;
  status: ConversationStatus;
  pinnedMessages?: string[];
  mutedStatus?: Record<string, boolean>;
  notificationSettings?: Record<string, boolean>;
  otherParticipantId?: string;
  otherParticipantName?: string;
  otherParticipantAvatar?: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// =================================================================
// TRANSACTION SERVICE
// =================================================================
export type TransactionStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'IN_DELIVERY'
  | 'DELIVERY'
  | 'COMPLETED'
  | 'PAYMENT_COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type TransactionType = 'SALE' | 'EXCHANGE' | 'DONATION';
export type DeliveryMethod = 'DELIVERY' | 'MEETUP' | 'PICKUP' | 'SHIPPING';

export interface CreateTransactionRequest {
  itemId: string;
  transactionType: TransactionType;
  quantity: number;
  price: number;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryNotes?: string;
  buyerNotes?: string;
}

export interface SubmitRatingRequest {
  rating: number; // 1..5
  comment?: string;
}

export interface TransactionResponse {
  id: string;
  itemId: string;
  itemTitle?: string;
  itemImageUrl?: string;
  itemPrice?: number;
  buyerId: string;
  sellerId: string;
  status: TransactionStatus;
  type?: TransactionType;
  quantity?: number;
  totalAmount?: number;
  totalPrice?: number;
  deliveryMethod?: DeliveryMethod;
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryPhone?: string;
  deliveryNotes?: string;
  buyerNotes?: string;
  sellerNotes?: string;
  deliveryTrackingCode?: string;
  buyerFeedback?: string;
  cancelledBy?: string;
  completedAt?: string;
  cancelledAt?: string;
  expiresAt?: string;
  feedbackSubmitted?: boolean;
  rating?: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}
