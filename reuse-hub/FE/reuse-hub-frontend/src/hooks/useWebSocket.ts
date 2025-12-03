import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SendMessageRequest, MessageResponse } from '../types/api';

// WebSocket connects directly to chat-service (port 8086)
// Note: In production, this should be configured via environment variable
const WS_URL = `http://localhost:8086/ws`;

// Global WebSocket client instance to avoid multiple connections
let globalClient: Client | null = null;
let globalSubscriptions: Map<string, StompSubscription> = new Map();
let globalMessageHandlers: Map<string, Set<(msg: MessageResponse) => void>> = new Map();

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: MessageResponse) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
}

export function useWebSocket({ userId, onMessage, onError, onConnected }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(globalClient?.active || false);
  const handlerIdRef = useRef<string>(`${userId}-${Date.now()}`);

  const connect = useCallback(() => {
    if (globalClient?.active) {
      setIsConnected(true);
      onConnected?.();
      return; // Already connected
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnected?.();

        const subscriptionKey = `messages-${userId}`;
        if (!globalSubscriptions.has(subscriptionKey)) {
          console.log(`Subscribing to /topic/messages/${userId}`);
          const subscription = client.subscribe(`/topic/messages/${userId}`, (message: IMessage) => {
            try {
              const data: MessageResponse = JSON.parse(message.body);
              console.log('Received message from topic:', data);
              
              // Notify all handlers
              globalMessageHandlers.forEach((handlers) => {
                handlers.forEach((handler) => handler(data));
              });
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });

          globalSubscriptions.set(subscriptionKey, subscription);
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
        onError?.(new Error(frame.headers['message'] || 'STOMP error'));
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        setIsConnected(false);
        onError?.(new Error('WebSocket connection error'));
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        globalSubscriptions.clear();
        globalMessageHandlers.clear();
      },
    });

    client.activate();
    globalClient = client;
  }, [userId, onError, onConnected]);

  const disconnect = useCallback(() => {
    // Remove this handler
    if (handlerIdRef.current) {
      globalMessageHandlers.delete(handlerIdRef.current);
    }
    
    // Only disconnect if no handlers left
    if (globalMessageHandlers.size === 0 && globalClient) {
      globalClient.deactivate();
      globalClient = null;
      globalSubscriptions.clear();
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((request: SendMessageRequest) => {
    if (!globalClient?.active) {
      const error = new Error('WebSocket client is not active');
      console.error('WebSocket not connected');
      throw error;
    }

    if (!request.senderId || !request.recipientId || !request.content) {
      const error = new Error('Invalid message request: missing required fields');
      console.error('Invalid message request:', request);
      throw error;
    }

    try {
      console.log('Publishing message to WebSocket:', {
        destination: '/app/send-message',
        request,
      });

      globalClient.publish({
        destination: '/app/send-message',
        body: JSON.stringify(request),
      });

      console.log('Message published successfully');
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }, []);

  // Register message handler
  useEffect(() => {
    if (onMessage) {
      if (!globalMessageHandlers.has(handlerIdRef.current)) {
        globalMessageHandlers.set(handlerIdRef.current, new Set());
      }
      globalMessageHandlers.get(handlerIdRef.current)?.add(onMessage);
    }

    return () => {
      if (handlerIdRef.current) {
        globalMessageHandlers.get(handlerIdRef.current)?.delete(onMessage!);
        if (globalMessageHandlers.get(handlerIdRef.current)?.size === 0) {
          globalMessageHandlers.delete(handlerIdRef.current);
        }
      }
    };
  }, [onMessage]);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
  };
}

