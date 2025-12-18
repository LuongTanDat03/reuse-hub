import React from 'react';
import { Check, X, RefreshCw, Tag, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { formatPrice } from '../../api/item';
import { MessageType, OfferStatus } from '../../api/chat';

interface PriceOfferCardProps {
  offerPrice: number;
  originalPrice?: number;
  offerStatus?: OfferStatus;
  messageType: MessageType;
  itemTitle?: string;
  itemThumbnail?: string;
  isSender: boolean;
  isSeller: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
  onBuyNow?: () => void;
}

export const PriceOfferCard: React.FC<PriceOfferCardProps> = ({
  offerPrice,
  originalPrice,
  offerStatus,
  messageType,
  itemTitle,
  itemThumbnail,
  isSender,
  isSeller,
  onAccept,
  onReject,
  onCounter,
  onBuyNow,
}) => {
  const isPending = offerStatus === 'PENDING';
  const isAccepted = offerStatus === 'ACCEPTED' || messageType === 'OFFER_ACCEPTED';
  const isRejected = offerStatus === 'REJECTED' || messageType === 'OFFER_REJECTED';
  const isCountered = offerStatus === 'COUNTERED' || messageType === 'OFFER_COUNTERED';

  const getStatusColor = () => {
    if (isAccepted) return 'bg-green-50 border-green-200';
    if (isRejected) return 'bg-red-50 border-red-200';
    if (isCountered) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getStatusBadge = () => {
    if (isAccepted) return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Đã chấp nhận</span>;
    if (isRejected) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Đã từ chối</span>;
    if (isCountered) return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Đề xuất mới</span>;
    if (isPending) return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Đang chờ</span>;
    return null;
  };

  const getTitle = () => {
    if (messageType === 'OFFER_ACCEPTED') return 'Đã chấp nhận giá';
    if (messageType === 'OFFER_REJECTED') return 'Đã từ chối đề xuất';
    if (messageType === 'OFFER_COUNTERED') return 'Đề xuất giá mới';
    return 'Đề xuất giá';
  };

  const discount = originalPrice && originalPrice > 0 
    ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) 
    : 0;

  return (
    <div className={`rounded-lg border p-3 max-w-[280px] ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{getTitle()}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Item info */}
      {(itemTitle || itemThumbnail) && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-white/50 rounded">
          {itemThumbnail && (
            <img 
              src={itemThumbnail} 
              alt={itemTitle || 'Product'} 
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <span className="text-xs text-gray-600 line-clamp-2">{itemTitle}</span>
        </div>
      )}

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(offerPrice)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-green-600 font-medium">
              -{discount}%
            </span>
          )}
        </div>
        {originalPrice && originalPrice !== offerPrice && (
          <div className="text-xs text-gray-500">
            Giá gốc: <span className="line-through">{formatPrice(originalPrice)}</span>
          </div>
        )}
      </div>

      {/* Actions - Only show for seller when pending */}
      {isPending && isSeller && !isSender && (
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
            onClick={onAccept}
          >
            <Check className="w-4 h-4 mr-1" />
            Chấp nhận
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            onClick={onReject}
          >
            <X className="w-4 h-4 mr-1" />
            Từ chối
          </Button>
        </div>
      )}

      {/* Counter offer button */}
      {isPending && isSeller && !isSender && onCounter && (
        <Button
          size="sm"
          variant="ghost"
          className="w-full mt-2 text-yellow-600 hover:bg-yellow-50"
          onClick={onCounter}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Đề xuất giá khác
        </Button>
      )}

      {/* Buy Now button - Show for buyer when offer is accepted */}
      {isAccepted && !isSeller && onBuyNow && (
        <Button
          size="sm"
          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
          onClick={onBuyNow}
        >
          <ShoppingCart className="w-4 h-4 mr-1" />
          Mua ngay
        </Button>
      )}
    </div>
  );
};

export default PriceOfferCard;
