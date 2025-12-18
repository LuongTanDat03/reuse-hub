import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuctionWebSocketMessage, BidResponse } from '../types/auction';
import { API_BASE_URL } from '../types/constants';

interface UseAuctionWebSocketProps {
  auctionId: string;
  onNewBid?: (bid: BidResponse) => void;
  onOutbid?: (message: string) => void;
  onAuctionEnded?: () => void;
  onError?: (error: string) => void;
}

export const useAuctionWebSocket = ({
  auctionId,
  onNewBid,
  onOutbid,
  onAuctionEnded,
  onError,
}: UseAuctionWebSocketProps) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/auction/ws/auction`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },
      onConnect: () => {
        console.log('Connected to auction WebSocket');
        setIsConnected(true);
        setConnectionError(null);

        // Subscribe to auction updates
        client.subscribe(`/topic/auction/${auctionId}`, (message: IMessage) => {
          try {
            const data: AuctionWebSocketMessage = JSON.parse(message.body);
            console.log('Received auction message:', data);

            switch (data.type) {
              case 'NEW_BID':
                if (data.bid && onNewBid) {
                  onNewBid(data.bid);
                }
                break;
              case 'OUTBID':
                if (data.message && onOutbid) {
                  onOutbid(data.message);
                }
                break;
              case 'AUCTION_ENDED':
                if (onAuctionEnded) {
                  onAuctionEnded();
                }
                break;
              case 'BID_ERROR':
                if (data.error && onError) {
                  onError(data.error);
                }
                break;
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from auction WebSocket');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setConnectionError('Lỗi kết nối WebSocket');
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [auctionId, onNewBid, onOutbid, onAuctionEnded, onError]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendBid = useCallback(
    (bidderId: string, amount: number) => {
      if (!clientRef.current?.connected) {
        console.error('WebSocket not connected');
        return false;
      }

      clientRef.current.publish({
        destination: `/app/auction/${auctionId}/bid`,
        body: JSON.stringify({ bidderId, amount }),
      });

      return true;
    },
    [auctionId]
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    sendBid,
    reconnect: connect,
  };
};
