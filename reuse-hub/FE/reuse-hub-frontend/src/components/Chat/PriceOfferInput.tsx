import React, { useState } from 'react';
import { Tag, X, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { formatPrice } from '../../api/item';

interface PriceOfferInputProps {
  itemTitle: string;
  itemThumbnail?: string;
  originalPrice: number;
  onSendOffer: (price: number) => void;
  onCancel: () => void;
  isCounter?: boolean;
}

export const PriceOfferInput: React.FC<PriceOfferInputProps> = ({
  itemTitle,
  itemThumbnail,
  originalPrice,
  onSendOffer,
  onCancel,
  isCounter = false,
}) => {
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOfferPrice(value);
    setError('');
  };

  const handleSubmit = () => {
    const price = parseInt(offerPrice, 10);
    
    if (!price || price <= 0) {
      setError('Vui lòng nhập giá hợp lệ');
      return;
    }

    if (price > originalPrice * 1.5) {
      setError('Giá đề xuất không được cao hơn 150% giá gốc');
      return;
    }

    onSendOffer(price);
  };

  const suggestedPrices = [
    { label: '-10%', value: Math.round(originalPrice * 0.9) },
    { label: '-20%', value: Math.round(originalPrice * 0.8) },
    { label: '-30%', value: Math.round(originalPrice * 0.7) },
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-600" />
          <span className="font-medium">
            {isCounter ? 'Đề xuất giá mới' : 'Trả giá'}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-blue-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Item info */}
      <div className="flex items-center gap-3 mb-3 p-2 bg-white rounded">
        {itemThumbnail && (
          <img 
            src={itemThumbnail} 
            alt={itemTitle} 
            className="w-12 h-12 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{itemTitle}</div>
          <div className="text-sm text-gray-500">
            Giá gốc: {formatPrice(originalPrice)}
          </div>
        </div>
      </div>

      {/* Price input */}
      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">
          Giá đề xuất của bạn
        </label>
        <div className="relative">
          <input
            type="text"
            value={offerPrice ? parseInt(offerPrice).toLocaleString('vi-VN') : ''}
            onChange={handlePriceChange}
            placeholder="Nhập giá..."
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            đ
          </span>
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>

      {/* Suggested prices */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-2">Gợi ý:</div>
        <div className="flex gap-2">
          {suggestedPrices.map((suggestion) => (
            <button
              key={suggestion.label}
              onClick={() => setOfferPrice(suggestion.value.toString())}
              className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600 transition"
            >
              {suggestion.label} ({formatPrice(suggestion.value)})
            </button>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={!offerPrice}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Send className="w-4 h-4 mr-2" />
        Gửi đề xuất giá
      </Button>
    </div>
  );
};

export default PriceOfferInput;
