import { useState, useEffect, useCallback, useRef } from 'react';
import * as chatAPI from '../api/chat';
import { ChatRoom, ChatMessage } from '../api/chat';
import { useAuth } from '../contexts/AuthContext';

export const useChat = (roomId?: string) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms
  const fetchRooms = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await chatAPI.getChatRooms(user.id, 0, 20);
      if (response.status === 200 && response.data) {
        setRooms(response.data.content || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch chat rooms:', err);
      setError('Không thể tải danh sách chat');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch specific room
  const fetchRoom = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await chatAPI.getChatRoom(user.id, id);
      if (response.status === 200 && response.data) {
        setCurrentRoom(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch chat room:', err);
      setError('Không thể tải phòng chat');
    }
  }, [user?.id]);

  // Fetch messages
  const fetchMessages = useCallback(async (id: string, pageNum: number = 0) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await chatAPI.getMessages(user.id, id, pageNum, 50);
      if (response.status === 200 && response.data) {
        const newMessages = response.data.content || [];
        
        if (pageNum === 0) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }
        
        setHasMore(newMessages.length === 50);
        setPage(pageNum);
      }
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError('Không thể tải tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Send message
  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!user?.id || !roomId) return;

    try {
      const request = {
        roomId,
        content,
        type: file ? ('FILE' as const) : ('TEXT' as const),
      };

      const response = await chatAPI.sendMessage(user.id, request, file);
      if (response.status === 200 && response.data) {
        setMessages(prev => [...prev, response.data!]);
        
        // Update room's last message
        setRooms(prev => prev.map(room => 
          room.id === roomId 
            ? { ...room, lastMessage: content, lastMessageTime: response.data!.createdAt }
            : room
        ));
        
        // Scroll to bottom
        scrollToBottom();
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError('Không thể gửi tin nhắn');
      throw err;
    }
  }, [user?.id, roomId]);

  // Mark messages as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      await chatAPI.markMessagesAsRead(user.id, id);
      
      // Update unread count in rooms
      setRooms(prev => prev.map(room => 
        room.id === id ? { ...room, unreadCount: 0 } : room
      ));
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [user?.id]);

  // Create or get chat room
  const createOrGetRoom = useCallback(async (otherUserId: string) => {
    if (!user?.id) return null;

    try {
      const response = await chatAPI.createOrGetChatRoom(user.id, otherUserId);
      if (response.status === 200 && response.data) {
        // Add to rooms if not exists
        setRooms(prev => {
          const exists = prev.find(r => r.id === response.data!.id);
          if (exists) return prev;
          return [response.data!, ...prev];
        });
        
        return response.data;
      }
    } catch (err: any) {
      console.error('Failed to create/get chat room:', err);
      setError('Không thể tạo phòng chat');
    }
    
    return null;
  }, [user?.id]);

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (roomId && hasMore && !loading) {
      fetchMessages(roomId, page + 1);
    }
  }, [roomId, hasMore, loading, page, fetchMessages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize
  useEffect(() => {
    if (user?.id) {
      fetchRooms();
    }
  }, [user?.id, fetchRooms]);

  // Load room and messages when roomId changes
  useEffect(() => {
    if (roomId && user?.id) {
      fetchRoom(roomId);
      fetchMessages(roomId, 0);
      markAsRead(roomId);
    }
  }, [roomId, user?.id, fetchRoom, fetchMessages, markAsRead]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    rooms,
    currentRoom,
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    markAsRead,
    createOrGetRoom,
    loadMoreMessages,
    refreshRooms: fetchRooms,
    messagesEndRef,
  };
};
