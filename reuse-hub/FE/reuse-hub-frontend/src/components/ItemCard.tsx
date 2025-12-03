import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as itemsAPI from '../api/items';

interface ItemCardProps {
  item: any;
  showActions?: boolean;
  onLikeChange?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, showActions = true, onLikeChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [liking, setLiking] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getConditionText = (condition: string) => {
    const conditions: { [key: string]: string } = {
      NEW: 'Mới',
      LIKE_NEW: 'Như mới',
      GOOD: 'Tốt',
      FAIR: 'Khá',
      POOR: 'Cũ',
    };
    return conditions[condition] || condition;
  };

  const getConditionColor = (condition: string) => {
    const colors: { [key: string]: string } = {
      NEW: 'bg-green-100 text-green-800',
      LIKE_NEW: 'bg-blue-100 text-blue-800',
      GOOD: 'bg-yellow-100 text-yellow-800',
      FAIR: 'bg-orange-100 text-orange-800',
      POOR: 'bg-red-100 text-red-800',
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'SOLD') {
      return (
        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Đã bán
        </div>
      );
    }
    if (status === 'RESERVED') {
      return (
        <div className="absolute top-2 left-2 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Đã đặt
        </div>
      );
    }
    return null;
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (liking) return;

    try {
      setLiking(true);
      
      if (isLiked) {
        await itemsAPI.unlikeItem(user.id, item.id);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await itemsAPI.likeItem(user.id, item.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      onLikeChange?.();
    } catch (error) {
      console.error('Failed to like/unlike item:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/items/${item.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        {getStatusBadge(item.status)}

        {/* Like Button */}
        {showActions && (
          <button
            onClick={handleLike}
            disabled={liking}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLiked ? (
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {item.title}
        </h3>

        {/* Price */}
        <p className="text-2xl font-bold text-blue-600 mb-2">
          {formatCurrency(item.price)}
        </p>

        {/* Condition */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(item.condition)}`}>
            {getConditionText(item.condition)}
          </span>
          {item.category && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {item.category}
            </span>
          )}
        </div>

        {/* Location & Date */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{item.location || 'Chưa rõ'}</span>
          </div>
          <span>{formatDate(item.createdAt)}</span>
        </div>

        {/* Stats */}
        {showActions && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{item.viewCount || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
