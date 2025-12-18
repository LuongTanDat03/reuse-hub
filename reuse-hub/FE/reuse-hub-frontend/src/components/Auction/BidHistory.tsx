import React from 'react';
import { BidResponse } from '../../types/auction';
import { formatPrice } from '../../api/auction';

interface BidHistoryProps {
  bids: BidResponse[];
  currentUserId?: string;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ bids, currentUserId }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getBidStatusBadge = (status: string, isHighest: boolean) => {
    if (isHighest && status === 'ACTIVE') {
      return <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Cao nhất</span>;
    }
    if (status === 'WON') {
      return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Thắng</span>;
    }
    if (status === 'OUTBID') {
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Đã vượt</span>;
    }
    return null;
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có lượt đấu giá nào</p>
        <p className="text-sm mt-1">Hãy là người đầu tiên đặt giá!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bids.map((bid, index) => {
        const isHighest = index === 0;
        const isCurrentUser = bid.bidderId === currentUserId;

        return (
          <div
            key={bid.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
            } ${isHighest ? 'ring-2 ring-green-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {bid.bidderAvatar ? (
                  <img src={bid.bidderAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {bid.bidderName?.charAt(0) || '?'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                    {isCurrentUser ? 'Bạn' : bid.bidderName || 'Người dùng'}
                  </span>
                  {getBidStatusBadge(bid.status, isHighest)}
                  {bid.isAutoBid && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Auto
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formatTime(bid.createdAt)}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className={`font-bold ${isHighest ? 'text-green-600' : 'text-gray-700'}`}>
                {formatPrice(bid.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
