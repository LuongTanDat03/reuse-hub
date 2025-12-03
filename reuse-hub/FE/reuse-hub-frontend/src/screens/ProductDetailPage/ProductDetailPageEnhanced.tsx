import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as itemsAPI from '../../api/item';
import * as transactionAPI from '../../api/transaction';
import * as recommendationAPI from '../../api/recommendation';
import * as chatAPI from '../../api/chat';
import { CreateTransactionRequest } from '../../types/api';
import ImageGallery from '../../components/ImageGallery';
import LoadingSpinner from '../../components/LoadingSpinner';
import ItemCard from '../../components/ItemCard';

const ProductDetailPageEnhanced: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState<any>(null);
  const [similarItems, setSimilarItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [creatingTransaction, setCreatingTransaction] = useState(false);

  useEffect(() => {
    if (itemId && user?.id) {
      loadItem();
      loadSimilarItems();
      recordView();
    }
  }, [itemId, user?.id]);

  const loadItem = async () => {
    if (!itemId || !user?.id) return;

    try {
      setLoading(true);
      const response = await itemsAPI.getItemById(itemId, user.id);

      if (response.status === 200 && response.data) {
        setItem(response.data);
        setIsLiked(response.data.isLiked || false);
        setLikeCount(response.data.likeCount || 0);
      }
    } catch (error) {
      console.error('Failed to load item:', error);
      alert('Không thể tải sản phẩm');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarItems = async () => {
    if (!itemId) return;

    try {
      const response = await recommendationAPI.getSimilarItems(itemId, 8);
      if (response.status === 200 && response.data) {
        setSimilarItems(response.data);
      }
    } catch (error) {
      console.error('Failed to load similar items:', error);
    }
  };

  const recordView = async () => {
    if (!user?.id || !itemId) return;

    try {
      await recommendationAPI.recordItemView(user.id, itemId);
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const handleLike = async () => {
    if (!user?.id || !itemId || liking) return;

    try {
      setLiking(true);

      if (isLiked) {
        await itemsAPI.unlikeItem(user.id, itemId);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        await recommendationAPI.recordItemInteraction(user.id, itemId, 'LIKE');
      } else {
        await itemsAPI.likeItem(user.id, itemId);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to like/unlike:', error);
      alert('Không thể thực hiện thao tác');
    } finally {
      setLiking(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user?.id || !item) return;

    try {
      // Create or get chat room with seller
      const response = await chatAPI.createOrGetChatRoom(user.id, item.userId);
      
      if (response.status === 200 && response.data) {
        // Record interaction
        await recommendationAPI.recordItemInteraction(user.id, itemId!, 'CONTACT');
        
        // Navigate to chat
        navigate(`/chat/${response.data.id}`);
      }
    } catch (error) {
      console.error('Failed to contact seller:', error);
      alert('Không thể mở chat');
    }
  };

  const handleBuyNow = async () => {
    if (!user?.id || !itemId || creatingTransaction) return;

    if (!confirm('Bạn có chắc muốn mua sản phẩm này?')) {
      return;
    }

    try {
      setCreatingTransaction(true);

      const txRequest: CreateTransactionRequest = {
        itemId: item.id,
        transactionType: 'SALE' as const,
        quantity: 1,
        price: item.price,
        deliveryMethod: 'DELIVERY' as const,
      };

      const response = await transactionAPI.createTransaction(user.id, txRequest);

      if (response.status === 200 && response.data) {
        alert('Đã tạo yêu cầu mua hàng!');
        navigate(`/transactions/${response.data.id}`);
      }
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      alert(error.response?.data?.message || 'Không thể tạo giao dịch');
    } finally {
      setCreatingTransaction(false);
    }
  };

  const handleShare = async () => {
    if (!item) return;

    const shareData = {
      title: item.title,
      text: `${item.title} - ${formatCurrency(item.price)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await recommendationAPI.recordItemInteraction(user!.id, itemId!, 'SHARE');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã copy link sản phẩm!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Đang tải sản phẩm..." />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === item.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">
            Trang chủ
          </button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate(`/category/${item.category}`)} className="hover:text-blue-600">
            {item.category}
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <ImageGallery images={item.images || []} alt={item.title} />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
              </div>

              {/* Details */}
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Thông tin chi tiết</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Danh mục</p>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tình trạng</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                      {getConditionText(item.condition)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Địa điểm</p>
                    <p className="font-medium">{item.location || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày đăng</p>
                    <p className="font-medium">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Items */}
            {similarItems.length > 0 && (
              <div className="mt-6">
                <h2 className="text-2xl font-bold mb-4">Sản phẩm tương tự</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarItems.map((similarItem) => (
                    <ItemCard key={similarItem.id} item={similarItem} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              {/* Title & Price */}
              <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                {formatCurrency(item.price)}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{item.viewCount || 0} lượt xem</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{likeCount} lượt thích</span>
                </div>
              </div>

              {/* Actions */}
              {!isOwner ? (
                <div className="space-y-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={creatingTransaction || item.status !== 'AVAILABLE'}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {creatingTransaction ? 'Đang xử lý...' : 'Mua ngay'}
                  </button>

                  <button
                    onClick={handleContactSeller}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat với người bán
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleLike}
                      disabled={liking}
                      className={`flex-1 px-6 py-3 rounded-lg border-2 transition-colors font-medium flex items-center justify-center gap-2 ${
                        isLiked
                          ? 'border-red-500 text-red-500 bg-red-50'
                          : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isLiked ? 'Đã thích' : 'Thích'}
                    </button>

                    <button
                      onClick={handleShare}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/items/${itemId}/edit`)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Chỉnh sửa sản phẩm
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                        // TODO: Implement delete
                        alert('Tính năng đang phát triển');
                      }
                    }}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Xóa sản phẩm
                  </button>
                </div>
              )}

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Thông tin người bán</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    {item.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{item.userName || 'User'}</p>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/profile/${item.userId}`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Xem trang cá nhân
                </button>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Lưu ý an toàn
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Gặp mặt tại nơi công cộng</li>
                  <li>• Kiểm tra kỹ sản phẩm trước khi thanh toán</li>
                  <li>• Không chuyển tiền trước</li>
                  <li>• Báo cáo nếu phát hiện gian lận</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPageEnhanced;
