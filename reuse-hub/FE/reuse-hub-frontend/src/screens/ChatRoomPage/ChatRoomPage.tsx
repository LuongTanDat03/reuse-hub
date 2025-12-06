import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { getOtherParticipant, formatMessageTime } from '../../api/chat';

const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentRoom,
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
    loadMoreMessages,
    hasMore,
    messagesEndRef,
  } = useChat(roomId);

  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const otherUser = currentRoom && user ? getOtherParticipant(currentRoom, user.id) : null;

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedFile) || sending) return;

    try {
      setSending(true);
      await sendMessage(messageText, selectedFile || undefined);
      setMessageText('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      if (scrollTop === 0 && hasMore && !loading) {
        loadMoreMessages();
      }
    }
  };

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy phòng chat</h2>
          <button
            onClick={() => navigate('/chat')}
            className="text-blue-600 hover:text-blue-800"
          >
            Quay lại danh sách chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/chat')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {otherUser && (
            <>
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold">{otherUser.name}</h2>
                <p className="text-sm text-gray-500">
                  {isConnected ? 'Đang hoạt động' : 'Đang kết nối...'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/profile/${otherUser.id}`)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Item info card (if available) - Sticky */}
        {currentRoom?.itemId && (
          <div className="sticky top-0 z-10 px-4 pb-3 bg-white border-b shadow-sm">
            <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
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
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMoreMessages}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tải thêm tin nhắn
                </button>
              </div>
            )}
            
            {messages.map((message) => {
              const isSent = message.senderId === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isSent
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border'
                      }`}
                    >
                      {message.type === 'IMAGE' && message.fileUrl ? (
                        <img
                          src={message.fileUrl}
                          alt="Attachment"
                          className="max-w-full rounded mb-2"
                        />
                      ) : message.type === 'FILE' && message.fileUrl ? (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 underline"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Tải xuống file
                        </a>
                      ) : null}
                      
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <p
                      className={`text-xs text-gray-500 mt-1 ${
                        isSent ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
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
      <div className="bg-white border-t p-4">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 rounded">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-sm text-gray-700 flex-1">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-gray-100 rounded-lg"
            disabled={sending}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />

          <button
            onClick={handleSend}
            disabled={(!messageText.trim() && !selectedFile) || sending || !isConnected}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
