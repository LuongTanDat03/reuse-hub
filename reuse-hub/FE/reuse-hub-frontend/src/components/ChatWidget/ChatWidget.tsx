import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { formatMessageTime } from '../../api/chat';

export const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const {
    rooms,
    currentRoom,
    messages,
    loading,
    isConnected,
    sendMessage,
    messagesEndRef,
  } = useChat(selectedConversationId || undefined);

  if (!user) return null;

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;
    
    try {
      await sendMessage(input.trim());
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherParticipant = (room: typeof currentRoom) => {
    if (!room || !user?.id) return null;
    return {
      id: room.otherParticipantId || room.participantIds.find(id => id !== user.id) || '',
      name: room.otherParticipantName || 'Unknown',
      avatar: room.otherParticipantAvatar,
    };
  };

  const otherParticipant = currentRoom ? getOtherParticipant(currentRoom) : null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedConversationId && (
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="p-1 hover:bg-blue-700 rounded"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h3 className="font-semibold">
                {selectedConversationId ? otherParticipant?.name || 'Chat' : 'Tin nhắn'}
              </h3>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedConversationId(null);
              }}
              className="p-1 hover:bg-blue-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {!selectedConversationId ? (
            // Conversations List
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500 text-sm">Đang tải...</div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 text-sm">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có hội thoại nào</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {rooms.map((room) => {
                    const other = getOtherParticipant(room);
                    return (
                      <button
                        key={room.id}
                        onClick={() => setSelectedConversationId(room.id)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        {/* Avatar or Item Thumbnail */}
                        {room.itemThumbnail ? (
                          <img 
                            src={room.itemThumbnail} 
                            alt={room.itemTitle}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        ) : other?.avatar ? (
                          <img 
                            src={other.avatar} 
                            alt={other.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 flex-shrink-0">
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
                          <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {room.unreadCount}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Chat Messages
            <>
              {/* Item Info (if available) - Sticky */}
              {currentRoom?.itemId && (
                <div className="sticky top-0 z-10 px-3 py-2 bg-blue-50 border-b shadow-sm">
                  <div className="flex items-center gap-2 text-xs">
                    {currentRoom.itemThumbnail && (
                      <img 
                        src={currentRoom.itemThumbnail} 
                        alt={currentRoom.itemTitle}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{currentRoom.itemTitle}</div>
                      <div className="text-gray-500">Sản phẩm đang trao đổi</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500 text-sm">Đang tải...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500 text-sm">Chưa có tin nhắn</div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMyMessage = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                              isMyMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border'
                            }`}
                          >
                            <p className="break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t bg-white rounded-b-lg">
                {!isConnected && (
                  <div className="text-xs text-amber-600 mb-2 text-center">
                    Đang kết nối...
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    disabled={!isConnected}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || !isConnected}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
