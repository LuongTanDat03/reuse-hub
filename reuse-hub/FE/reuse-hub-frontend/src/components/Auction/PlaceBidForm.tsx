import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AuctionResponse } from '../../types/auction';
import { formatPrice } from '../../api/auction';

interface PlaceBidFormProps {
  auction: AuctionResponse;
  onPlaceBid: (amount: number) => Promise<void>;
  onBuyNow?: () => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export const PlaceBidForm: React.FC<PlaceBidFormProps> = ({
  auction,
  onPlaceBid,
  onBuyNow,
  isLoading = false,
  disabled = false,
}) => {
  const minBid = auction.currentPrice + auction.bidIncrement;
  const [bidAmount, setBidAmount] = useState(minBid.toString());
  const [error, setError] = useState<string | null>(null);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setBidAmount(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseInt(bidAmount, 10);
    if (isNaN(amount) || amount < minBid) {
      setError(`Giá đấu tối thiểu là ${formatPrice(minBid)}`);
      return;
    }

    try {
      await onPlaceBid(amount);
      setBidAmount((amount + auction.bidIncrement).toString());
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleBuyNow = async () => {
    if (!onBuyNow) return;
    try {
      await onBuyNow();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    }
  };

  const quickBidAmounts = [
    minBid,
    minBid + auction.bidIncrement,
    minBid + auction.bidIncrement * 2,
    minBid + auction.bidIncrement * 5,
  ];

  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      {/* Current Price Info */}
      <div className="text-center pb-4 border-b">
        <p className="text-sm text-gray-500">Giá hiện tại</p>
        <p className="text-3xl font-bold text-[#214d8c]">
          {formatPrice(auction.currentPrice)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Bước giá: {formatPrice(auction.bidIncrement)}
        </p>
      </div>

      {/* User's Bid Status */}
      {auction.isUserHighestBidder && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-green-700 font-medium">🎉 Bạn đang là người đấu giá cao nhất!</p>
        </div>
      )}

      {auction.userHighestBid && !auction.isUserHighestBidder && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-orange-700 font-medium">
            ⚠️ Bạn đã bị vượt qua! Giá của bạn: {formatPrice(auction.userHighestBid)}
          </p>
        </div>
      )}

      {/* Bid Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhập giá đấu (tối thiểu {formatPrice(minBid)})
          </label>
          <Input
            type="text"
            value={bidAmount}
            onChange={handleBidChange}
            placeholder={`Tối thiểu ${formatPrice(minBid)}`}
            disabled={disabled || isLoading}
            className="text-lg font-semibold"
          />
        </div>

        {/* Quick Bid Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickBidAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setBidAmount(amount.toString())}
              disabled={disabled || isLoading}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              {formatPrice(amount)}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          type="submit"
          disabled={disabled || isLoading}
          className="w-full bg-[#214d8c] hover:bg-[#1a3d6e] text-white py-3 text-lg font-semibold"
        >
          {isLoading ? 'Đang xử lý...' : '🔨 Đặt giá'}
        </Button>
      </form>

      {/* Buy Now Button */}
      {auction.buyNowPrice && onBuyNow && (
        <div className="pt-4 border-t">
          <p className="text-center text-sm text-gray-500 mb-2">
            Hoặc mua ngay với giá
          </p>
          <Button
            onClick={handleBuyNow}
            disabled={disabled || isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
          >
            ⚡ Mua ngay {formatPrice(auction.buyNowPrice)}
          </Button>
        </div>
      )}
    </div>
  );
};
