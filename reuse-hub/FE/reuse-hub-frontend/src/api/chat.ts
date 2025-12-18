import axios from 'axios';
import { API_BASE_URL } from '../types/constants';
import { ApiResponse, Page } from '../types/api';

// Types matching backend DTOs
export interface ConversationResponse {
  id: string;
  participantIds: string[];
  lastMessageId?: string;
  lastMessageTimestamp?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  pinnedMessages?: string[];
  mutedStatus?: Record<string, boolean>;
  notificationSettings?: Record<string, boolean>;
  otherParticipantId?: string;
  otherParticipantName?: string;
  otherParticipantAvatar?: string;
  itemId?: string;
  itemTitle?: string;
  itemThumbnail?: string;
  itemPrice?: number;
  itemOwnerId?: string;
}

export type MessageType = 
  | 'TEXT' 
  | 'IMAGE' 
  | 'FILE' 
  | 'SYSTEM'
  | 'PRICE_OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'OFFER_COUNTERED';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  media?: string[];
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  type: MessageType;
  reactions?: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  // Price offer fields
  offerPrice?: number;
  offerStatus?: OfferStatus;
  relatedOfferId?: string;
  itemId?: string;
  itemTitle?: string;
  itemThumbnail?: string;
  originalPrice?: number;
}

export interface SendMessageRequest {
  senderId: string;
  recipientId: string;
  content: string;
  conversationId?: string;
  messageType?: MessageType;
  // Price offer fields
  offerPrice?: number;
  relatedOfferId?: string;
  itemId?: string;
  itemTitle?: string;
  itemThumbnail?: string;
  originalPrice?: number;
}

// Legacy types for backward compatibility
export interface ChatRoom extends ConversationResponse {
  participant1Id: string;
  participant2Id: string;
  participant1Name: string;
  participant2Name: string;
  participant1Avatar?: string;
  participant2Avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  // Item info (inherited from ConversationResponse but explicitly listed)
  itemId?: string;
  itemTitle?: string;
  itemThumbnail?: string;
  itemPrice?: number;
}

export interface ChatMessage extends MessageResponse {
  roomId: string;
  senderName: string;
  fileUrl?: string;
  isRead: boolean;
}

const getAuthHeaders = (userId: string) => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
    'X-User-Id': userId,
  };
};

// Conversation APIs (matching backend)
export const getMyConversations = async (
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<ApiResponse<Page<ConversationResponse>>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chats/conservations`,
      { 
        headers: getAuthHeaders(userId),
        params: { page, size }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get conversations error:', error);
    throw error;
  }
};

export const getConversation = async (
  userId: string,
  otherUserId: string,
  itemId?: string
): Promise<ApiResponse<ConversationResponse>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chats/conservations/with/${otherUserId}`,
      { 
        headers: getAuthHeaders(userId),
        params: itemId ? { itemId } : undefined
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get conversation error:', error);
    throw error;
  }
};

export const createOrGetConversation = async (
  userId: string,
  otherUserId: string,
  itemId?: string
): Promise<ApiResponse<ConversationResponse>> => {
  try {
    console.log('=== Creating Conversation ===');
    console.log('userId (current user):', userId);
    console.log('otherUserId (seller):', otherUserId);
    console.log('itemId (product):', itemId);
    
    const headers = getAuthHeaders(userId);
    console.log('Headers:', headers);
    
    const response = await axios.post(
      `${API_BASE_URL}/chats/conservations/create/${otherUserId}`,
      {},
      { 
        headers,
        params: itemId ? { itemId } : undefined
      }
    );
    console.log('Conversation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Create conversation error:', error);
    throw error;
  }
};

export const getMessages = async (
  userId: string,
  conversationId: string,
  page: number = 0,
  size: number = 50
): Promise<ApiResponse<Page<MessageResponse>>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chats/conservations/${conversationId}/messages`,
      { 
        headers: getAuthHeaders(userId),
        params: { page, size }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get messages error:', error);
    throw error;
  }
};

// Legacy APIs for backward compatibility
export const getChatRooms = async (
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<ApiResponse<Page<ChatRoom>>> => {
  const response = await getMyConversations(userId, page, size);
  // Convert ConversationResponse to ChatRoom format
  if (response.data && 'content' in response.data) {
    const conversations = response.data.content as ConversationResponse[];
    const chatRooms: ChatRoom[] = conversations.map(conv => ({
      ...conv,
      participant1Id: conv.participantIds[0] || '',
      participant2Id: conv.participantIds[1] || '',
      participant1Name: conv.otherParticipantName || '',
      participant2Name: conv.otherParticipantName || '',
      participant1Avatar: conv.otherParticipantAvatar,
      participant2Avatar: conv.otherParticipantAvatar,
      lastMessage: '',
      lastMessageTime: conv.lastMessageTimestamp,
      unreadCount: 0,
      createdAt: conv.lastMessageTimestamp || new Date().toISOString(),
      // Item info
      itemId: conv.itemId,
      itemTitle: conv.itemTitle,
      itemThumbnail: conv.itemThumbnail,
      itemPrice: conv.itemPrice,
    }));
    return {
      ...response,
      data: {
        ...response.data,
        content: chatRooms
      }
    };
  }
  return response as any;
};

export const getConversationById = async (
  userId: string,
  conversationId: string
): Promise<ApiResponse<ConversationResponse>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chats/conservations/${conversationId}`,
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get conversation by id error:', error);
    throw error;
  }
};

export const getChatRoom = async (
  userId: string,
  conversationId: string
): Promise<ApiResponse<ChatRoom>> => {
  const response = await getConversationById(userId, conversationId);
  if (response.data) {
    const conv = response.data;
    const chatRoom: ChatRoom = {
      ...conv,
      participant1Id: conv.participantIds[0] || '',
      participant2Id: conv.participantIds[1] || '',
      participant1Name: conv.otherParticipantName || '',
      participant2Name: conv.otherParticipantName || '',
      participant1Avatar: conv.otherParticipantAvatar,
      participant2Avatar: conv.otherParticipantAvatar,
      lastMessage: '',
      lastMessageTime: conv.lastMessageTimestamp,
      unreadCount: 0,
      createdAt: conv.lastMessageTimestamp || new Date().toISOString(),
    };
    return {
      status: 200,
      message: 'Success',
      data: chatRoom,
      timestamp: new Date().toISOString()
    };
  }
  throw new Error('Conversation not found');
};

export const createOrGetChatRoom = async (
  userId: string,
  otherUserId: string,
  itemId?: string
): Promise<ApiResponse<ChatRoom>> => {
  const response = await createOrGetConversation(userId, otherUserId, itemId);
  if (response.data) {
    const conv = response.data;
    const chatRoom: ChatRoom = {
      ...conv,
      participant1Id: conv.participantIds[0] || '',
      participant2Id: conv.participantIds[1] || '',
      participant1Name: conv.otherParticipantName || '',
      participant2Name: conv.otherParticipantName || '',
      participant1Avatar: conv.otherParticipantAvatar,
      participant2Avatar: conv.otherParticipantAvatar,
      lastMessage: '',
      lastMessageTime: conv.lastMessageTimestamp,
      unreadCount: 0,
      createdAt: conv.lastMessageTimestamp || new Date().toISOString(),
    };
    return {
      ...response,
      data: chatRoom
    };
  }
  return response as any;
};

export const sendMessage = async (
  _userId: string,
  _request: { roomId: string; content: string; type?: string },
  _file?: File
): Promise<ApiResponse<ChatMessage>> => {
  // Note: Backend uses WebSocket for sending messages
  // This is a placeholder for file uploads if needed
  throw new Error('Use WebSocket to send messages. File upload not yet implemented.');
};

export const markMessagesAsRead = async (
  _userId: string,
  _conversationId: string
): Promise<ApiResponse<void>> => {
  // This would need to be implemented in backend if needed
  console.warn('Mark as read not yet implemented in backend');
  return {
    status: 200,
    message: 'Success',
    data: undefined,
    timestamp: new Date().toISOString()
  };
};

export const deleteMessage = async (
  _userId: string,
  _messageId: string
): Promise<ApiResponse<void>> => {
  // This would need to be implemented in backend if needed
  console.warn('Delete message not yet implemented in backend');
  return {
    status: 200,
    message: 'Success',
    data: undefined,
    timestamp: new Date().toISOString()
  };
};

// Utility functions
export const formatMessageTime = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} giờ`;
  } else {
    return messageTime.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  }
};

export const getOtherParticipant = (room: ChatRoom, currentUserId: string) => {
  if (room.participant1Id === currentUserId) {
    return {
      id: room.participant2Id,
      name: room.participant2Name,
      avatar: room.participant2Avatar,
    };
  } else {
    return {
      id: room.participant1Id,
      name: room.participant1Name,
      avatar: room.participant1Avatar,
    };
  }
};
