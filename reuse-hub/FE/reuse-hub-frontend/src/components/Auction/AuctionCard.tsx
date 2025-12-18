import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuctionResponse } from '../../types/auction';
import { formatPrice, formatTimeRemaining, getAuctionStatusColor, getAuctionStatusText } from '../../api/auction';

interface AuctionCardProps {
  auction: AuctionResponse;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(auction.timeRemaining);

  useEffect(() => {
    if (auction.status !== 'ACTIVE') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.status]);

  const handleClick = () => {
    navigate(`/auction/${auction.id}`);
  };

  const isEnding = timeRemaining > 0 && timeRemaining < 3600; // Less than 1 hour

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={auction.images?.[0] || '/placeholder-image.png'}
          alt={auction.title}
          className="w-full h-full object-cover"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getAuctionStatusColor(auction.status)}`}>
          {getAuctionStatusText(auction.status)}
        </div>

        {/* Time Remaining */}
        {auction.status === 'ACTIVE' && (
          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${
            isEnding ? 'bg-red-500 text-white animate-pulse' : 'bg-black/70 text-white'
          }`}>
            ⏱️ {formatTimeRemaining(timeRemaining)}
          </div>
        )}

        {/* Buy Now Badge */}
        {auction.buyNowPrice && auction.status === 'ACTIVE' && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            Mua ngay
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[48px]">
          {auction.title}
        </h3>

        {/* Current Price */}
        <div className="mb-2">
          <p className="text-xs text-gray-500">Giá hiện tại</p>
          <p className="text-lg font-bold text-[#214d8c]">
            {formatPrice(auction.currentPrice)}
          </p>
        </div>

        {/* Buy Now Price */}
        {auction.buyNowPrice && (
          <div className="mb-2">
            <p className="text-xs text-gray-500">Mua ngay</p>
            <p className="text-sm font-semibold text-orange-600">
              {formatPrice(auction.buyNowPrice)}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
          <span>🔨 {auction.bidCount} lượt đấu giá</span>
          {auction.uniqueBidders && (
            <span>👥 {auction.uniqueBidders} người</span>
          )}
        </div>
      </div>
    </div>
  );
};
