import axios from 'axios';
import { API_BASE_URL } from '../types/constants';
import { ApiResponse, Page } from '../types/api';

// Types
export interface ChatRoom {
  id: string;
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
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
}

const getAuthHeaders = (userId: string) => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
    'X-User-Id': userId,
  };
};

// Chat Room APIs
export const getChatRooms = async (
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<ApiResponse<Page<ChatRoom>>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/rooms?page=${page}&size=${size}`,
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get chat rooms error:', error);
    throw error;
  }
};

export const getChatRoom = async (
  userId: string,
  roomId: string
): Promise<ApiResponse<ChatRoom>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/rooms/${roomId}`,
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get chat room error:', error);
    throw error;
  }
};

export const createOrGetChatRoom = async (
  userId: string,
  otherUserId: string
): Promise<ApiResponse<ChatRoom>> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat/rooms`,
      { otherUserId },
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Create chat room error:', error);
    throw error;
  }
};

// Message APIs
export const getMessages = async (
  userId: string,
  roomId: string,
  page: number = 0,
  size: number = 50
): Promise<ApiResponse<Page<ChatMessage>>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/rooms/${roomId}/messages?page=${page}&size=${size}`,
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Get messages error:', error);
    throw error;
  }
};

export const sendMessage = async (
  userId: string,
  request: SendMessageRequest,
  file?: File
): Promise<ApiResponse<ChatMessage>> => {
  try {
    if (file) {
      const formData = new FormData();
      formData.append('roomId', request.roomId);
      formData.append('content', request.content);
      formData.append('type', request.type || 'FILE');
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/chat/messages/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(userId),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } else {
      const response = await axios.post(
        `${API_BASE_URL}/chat/messages`,
        request,
        { headers: getAuthHeaders(userId) }
      );
      return response.data;
    }
  } catch (error: any) {
    console.error('Send message error:', error);
    throw error;
  }
};

export const markMessagesAsRead = async (
  userId: string,
  roomId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/chat/rooms/${roomId}/read`,
      {},
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Mark messages as read error:', error);
    throw error;
  }
};

export const deleteMessage = async (
  userId: string,
  messageId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/chat/messages/${messageId}`,
      { headers: getAuthHeaders(userId) }
    );
    return response.data;
  } catch (error: any) {
    console.error('Delete message error:', error);
    throw error;
  }
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
