import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { getOtherParticipant, formatMessageTime } from '../../api/chat';

const ChatListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms, loading } = useChat();

  const handleRoomClick = (roomId: string) => {
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold">Tin nhắn</h1>
          <p className="text-gray-600 mt-1">
            Quản lý cuộc trò chuyện với người mua và người bán
          </p>
        </div>

        {/* Chat Rooms List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Chưa có tin nhắn</h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu trò chuyện với người bán khi bạn quan tâm đến sản phẩm
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y">
            {rooms.map((room) => {
              const otherUser = getOtherParticipant(room, user!.id);
              
              return (
                <div
                  key={room.id}
                  onClick={() => handleRoomClick(room.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherUser.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherUser.name}
                        </h3>
                        {room.lastMessageTime && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatMessageTime(room.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 truncate">
                          {room.lastMessage || 'Chưa có tin nhắn'}
                        </p>
                        
                        {room.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListPage;
