import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { Button } from '../../components/ui/button';

export default function ChatPage() {
  const { targetUserId } = useParams<{ targetUserId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  
  // Get itemId from query params
  const searchParams = new URLSearchParams(window.location.search);
  const itemId = searchParams.get('itemId') || undefined;
  
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
    createOrGetRoom,
    messagesEndRef,
  } = useChat(roomId || undefined);

  // Create or get room when targetUserId changes
  useEffect(() => {
    if (targetUserId && user?.id && !roomId) {
      console.log('ChatPage creating room with itemId:', itemId);
      createOrGetRoom(targetUserId, itemId).then((room) => {
        if (room) {
          setRoomId(room.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, user?.id, itemId]);

  const handleSend = async () => {
    if (!input.trim() || !roomId) return;
    
    try {
      await sendMessage(input.trim());
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/room/${conversationId}`);
  };

  const getOtherParticipant = (room: typeof currentRoom) => {
    if (!room || !user?.id) return null;
    // Use otherParticipantId directly from the response
    return {
      id: room.otherParticipantId || room.participantIds.find(id => id !== user.id) || '',
      name: room.otherParticipantName || 'Unknown',
      avatar: room.otherParticipantAvatar
    };
  };

  if (!user) {
    return <div className="p-4">Vui lòng đăng nhập</div>;
  }

  if (!targetUserId) {
    return <div className="p-4">Thiếu targetUserId</div>;
  }

  const otherParticipant = currentRoom ? getOtherParticipant(currentRoom) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-12 h-screen">
        {/* Sidebar contacts */}
        <aside className="col-span-3 border-r bg-white flex flex-col">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Tin nhắn</h2>
            <div className="mt-2">
              <input 
                className="w-full rounded-md border px-3 py-2 text-sm" 
                placeholder="Tìm người chat" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-gray-500">Đang tải...</div>
            ) : rooms.length === 0 ? (
              <div className="p-4 text-gray-500">Chưa có hội thoại</div>
            ) : (
              rooms.map((room) => {
                const other = getOtherParticipant(room);
                console.log('Room in sidebar:', { 
                  roomId: room.id, 
                  otherParticipantId: room.otherParticipantId,
                  participantIds: room.participantIds,
                  otherId: other?.id,
                  itemId: room.itemId
                });
                return (
                  <button
                    key={room.id}
                    onClick={() => handleConversationClick(room.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b ${
                      room.id === roomId ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Avatar or Item Thumbnail */}
                    {room.itemThumbnail ? (
                      <div className="relative">
                        <img 
                          src={room.itemThumbnail} 
                          alt={room.itemTitle}
                          className="w-10 h-10 rounded object-cover"
                        />
                      </div>
                    ) : other?.avatar ? (
                      <img 
                        src={other.avatar} 
                        alt={other.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                        {(other?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{other?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {room.itemTitle || room.lastMessage || 'Bắt đầu trò chuyện'}
                      </div>
                    </div>
                    {room.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {room.unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat content */}
        <section className="col-span-9 flex flex-col">
          {/* Header with seller info */}
          <div className="px-4 py-3 border-b bg-white">
            <div className="flex items-center gap-3">
              {otherParticipant?.avatar ? (
                <img 
                  src={otherParticipant.avatar} 
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {(otherParticipant?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium">{otherParticipant?.name || 'Loading...'}</div>
                <div className="text-xs text-gray-500">
                  {isConnected ? 'Đang hoạt động' : 'Đang kết nối...'}
                </div>
              </div>
            </div>
          </div>

          {/* Item info card (if available) - Sticky */}
          {currentRoom?.itemId && (
            <div className="sticky top-0 z-10 px-4 py-3 bg-blue-50 border-b shadow-sm">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                {currentRoom.itemThumbnail && (
                  <img 
                    src={currentRoom.itemThumbnail} 
                    alt={currentRoom.itemTitle}
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{currentRoom.itemTitle || 'Sản phẩm'}</div>
                  <div className="text-xs text-gray-500">Sản phẩm đang trao đổi</div>
                </div>
                <button
                  onClick={() => navigate(`/product/${currentRoom.itemId}`)}
                  className="text-blue-600 text-xs hover:underline whitespace-nowrap"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Đang tải tin nhắn...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">{error}</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Chưa có tin nhắn nào</div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                        msg.senderId === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="px-4 py-3 border-t bg-white flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!roomId || loading}
            />
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || !roomId || loading || !isConnected}
            >
              {isConnected ? 'Gửi' : 'Đang kết nối...'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
