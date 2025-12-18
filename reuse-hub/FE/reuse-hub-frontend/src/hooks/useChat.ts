import { useState, useEffect, useCallback, useRef } from 'react';
import * as chatAPI from '../api/chat';
import { ChatRoom, ChatMessage, MessageResponse } from '../api/chat';
import { getItemById } from '../api/item';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  // WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    const socket = new SockJS('http://localhost:8086/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => console.log('STOMP:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Subscribe to messages for this user
        stompClient.subscribe(`/topic/messages/${user.id}`, (message) => {
          try {
            const messageData: MessageResponse = JSON.parse(message.body);
            console.log('Received message:', messageData);
            console.log('Message type:', messageData.type, 'offerPrice:', messageData.offerPrice);
            
            // Convert to ChatMessage format
            const chatMessage: ChatMessage = {
              ...messageData,
              roomId: messageData.conversationId,
              senderName: messageData.senderId === user.id ? user.username || 'You' : 'Other',
              type: messageData.type as any,
              isRead: messageData.status === 'READ',
            };

            // Add message if it belongs to current conversation
            if (conversationId && messageData.conversationId === conversationId) {
              setMessages(prev => {
                // Remove temp message if exists
                const filtered = prev.filter(m => !m.id.startsWith('temp-'));
                // Check if message already exists
                if (filtered.some(m => m.id === chatMessage.id)) {
                  return prev;
                }
                return [...filtered, chatMessage];
              });
              scrollToBottom();
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });

        // Subscribe to responses (success/error)
        stompClient.subscribe('/user/queue/responses', (message) => {
          try {
            const response = JSON.parse(message.body);
            if (response.status === 'error') {
              console.error('WebSocket error:', response.message);
              setError(response.message || 'Lỗi khi gửi tin nhắn');
            } else if (response.status === 'success') {
              console.log('Message sent successfully');
            }
          } catch (error) {
            console.error('Error parsing response:', message.body);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setError('Lỗi kết nối WebSocket');
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [user?.id, conversationId]);


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
        let room = response.data;
        
        // If room has itemId but missing item info, fetch from item service
        if (room.itemId && (!room.itemPrice || room.itemPrice === 0 || !room.itemOwnerId)) {
          try {
            const itemResponse = await getItemById(room.itemId, user.id);
            if (itemResponse.status === 200 && itemResponse.data) {
              room = {
                ...room,
                itemPrice: itemResponse.data.price || room.itemPrice,
                itemTitle: room.itemTitle || itemResponse.data.title,
                itemThumbnail: room.itemThumbnail || (itemResponse.data.images?.[0] ?? undefined),
                itemOwnerId: room.itemOwnerId || itemResponse.data.userId,
              };
            }
          } catch (itemErr) {
            console.warn('Could not fetch item info:', itemErr);
          }
        }
        
        setCurrentRoom(room);
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
        
        // Convert MessageResponse to ChatMessage
        const chatMessages: ChatMessage[] = newMessages.map((msg: MessageResponse) => ({
          ...msg,
          roomId: msg.conversationId,
          senderName: msg.senderId === user.id ? user.username || 'You' : 'Other',
          type: msg.type as any,
          isRead: msg.status === 'READ',
        }));
        
        if (pageNum === 0) {
          setMessages(chatMessages);
        } else {
          setMessages(prev => [...chatMessages, ...prev]);
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


  // Send message via WebSocket
  const sendMessage = useCallback(async (
    content: string, 
    file?: File,
    offerData?: {
      messageType: chatAPI.MessageType;
      offerPrice?: number;
      relatedOfferId?: string;
      itemId?: string;
      itemTitle?: string;
      itemThumbnail?: string;
      originalPrice?: number;
    }
  ) => {
    if (!user?.id || !currentRoom) return;

    try {
      if (file) {
        throw new Error('File upload not yet implemented');
      } else {
        if (!stompClientRef.current || !isConnected) {
          throw new Error('WebSocket not connected. Please wait...');
        }

        const recipientId = currentRoom.otherParticipantId || 
          currentRoom.participantIds.find(id => id !== user.id) || '';
        
        if (!recipientId) {
          throw new Error('Cannot find recipient ID');
        }

        const messageType = offerData?.messageType || 'TEXT';

        // Optimistically add message to UI
        const tempMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          conversationId: currentRoom.id,
          roomId: currentRoom.id,
          senderId: user.id,
          recipientId: recipientId,
          senderName: user.username || 'You',
          content,
          type: messageType,
          status: 'SENT',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          reactions: {},
          offerPrice: offerData?.offerPrice,
          offerStatus: offerData?.messageType === 'PRICE_OFFER' || offerData?.messageType === 'OFFER_COUNTERED' ? 'PENDING' : undefined,
          relatedOfferId: offerData?.relatedOfferId,
          itemId: offerData?.itemId,
          itemTitle: offerData?.itemTitle,
          itemThumbnail: offerData?.itemThumbnail,
          originalPrice: offerData?.originalPrice,
        };
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();


        // Send via WebSocket
        const messageRequest: chatAPI.SendMessageRequest = {
          senderId: user.id,
          recipientId: recipientId,
          content: content,
          conversationId: currentRoom.id,
          messageType: messageType,
          offerPrice: offerData?.offerPrice,
          relatedOfferId: offerData?.relatedOfferId,
          itemId: offerData?.itemId,
          itemTitle: offerData?.itemTitle,
          itemThumbnail: offerData?.itemThumbnail,
          originalPrice: offerData?.originalPrice,
        };
        
        console.log('Sending message request:', messageRequest);

        stompClientRef.current.publish({
          destination: '/app/send-message',
          body: JSON.stringify(messageRequest),
        });
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Không thể gửi tin nhắn');
      throw err;
    }
  }, [user, currentRoom, isConnected]);

  // Mark messages as read
  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) return;

    try {
      await chatAPI.markMessagesAsRead(user.id, id);
      setRooms(prev => prev.map(room => 
        room.id === id ? { ...room, unreadCount: 0 } : room
      ));
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [user?.id]);


  // Create or get chat room
  const createOrGetRoom = useCallback(async (otherUserId: string, itemId?: string) => {
    if (!user?.id) return null;

    try {
      const response = await chatAPI.createOrGetChatRoom(user.id, otherUserId, itemId);
      if (response.status === 200 && response.data) {
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
    if (conversationId && hasMore && !loading) {
      fetchMessages(conversationId, page + 1);
    }
  }, [conversationId, hasMore, loading, page, fetchMessages]);

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

  // Load room and messages when conversationId changes
  useEffect(() => {
    if (conversationId && user?.id) {
      fetchRoom(conversationId);
      fetchMessages(conversationId, 0);
      markAsRead(conversationId);
    }
  }, [conversationId, user?.id, fetchRoom, fetchMessages, markAsRead]);

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
    isConnected,
    sendMessage,
    markAsRead,
    createOrGetRoom,
    loadMoreMessages,
    refreshRooms: fetchRooms,
    messagesEndRef,
  };
};
