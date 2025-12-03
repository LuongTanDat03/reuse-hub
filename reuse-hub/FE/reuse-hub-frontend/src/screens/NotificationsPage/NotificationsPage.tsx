import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { getNotificationIcon, getNotificationColor, formatNotificationTime } from '../../api/notification';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'TRANSACTION_CREATED':
      case 'TRANSACTION_ACCEPTED':
      case 'TRANSACTION_REJECTED':
        if (notification.relatedId) {
          navigate(`/transactions/${notification.relatedId}`);
        }
        break;
      case 'PAYMENT_COMPLETED':
      case 'PAYMENT_FAILED':
        if (notification.relatedId) {
          navigate(`/payments/${notification.relatedId}`);
        }
        break;
      case 'ITEM_LIKED':
      case 'ITEM_SOLD':
        if (notification.relatedId) {
          navigate(`/items/${notification.relatedId}`);
        }
        break;
      case 'NEW_COMMENT':
        if (notification.relatedId) {
          navigate(`/items/${notification.relatedId}#comments`);
        }
        break;
      case 'NEW_FOLLOWER':
        if (notification.relatedId) {
          navigate(`/profile/${notification.relatedId}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationBgColor = (type: string) => {
    const color = getNotificationColor(type);
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      red: 'bg-red-50',
      pink: 'bg-pink-50',
      purple: 'bg-purple-50',
      gray: 'bg-gray-50',
    };
    return colorMap[color] || 'bg-gray-50';
  };

  const getNotificationTextColor = (type: string) => {
    const color = getNotificationColor(type);
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      pink: 'text-pink-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600',
    };
    return colorMap[color] || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Thông báo</h1>
              {unreadCount > 0 && (
                <p className="text-gray-600 mt-1">
                  Bạn có {unreadCount} thông báo chưa đọc
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">Chưa có thông báo</h3>
            <p className="text-gray-600">
              Bạn sẽ nhận được thông báo về giao dịch, tin nhắn và hoạt động khác tại đây
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getNotificationBgColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold mb-1 ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <span className="text-xs text-blue-600 font-medium">
                                Mới
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Xóa thông báo"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
