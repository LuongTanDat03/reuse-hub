import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as transactionAPI from '../../api/transaction';

const TransactionDetailPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (transactionId && user?.id) {
      loadTransaction();
    }
  }, [transactionId, user?.id]);

  const loadTransaction = async () => {
    if (!transactionId || !user?.id) return;

    try {
      setLoading(true);
      const response = await transactionAPI.getTransaction(user.id, transactionId);
      
      if (response.status === 200 && response.data) {
        setTransaction(response.data);
      }
    } catch (error) {
      console.error('Failed to load transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!transactionId || !user?.id) return;

    try {
      setActionLoading(true);
      await transactionAPI.acceptTransaction(user.id, transactionId);
      alert('Đã chấp nhận giao dịch!');
      loadTransaction();
    } catch (error) {
      console.error('Failed to accept transaction:', error);
      alert('Không thể chấp nhận giao dịch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!transactionId || !user?.id || !rejectReason.trim()) return;

    try {
      setActionLoading(true);
      await transactionAPI.rejectTransaction(user.id, transactionId, rejectReason);
      alert('Đã từ chối giao dịch');
      setShowRejectModal(false);
      loadTransaction();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
      alert('Không thể từ chối giao dịch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!transactionId || !user?.id) return;
    if (!confirm('Bạn có chắc muốn hủy giao dịch này?')) return;

    try {
      setActionLoading(true);
      await transactionAPI.cancelTransaction(user.id, transactionId);
      alert('Đã hủy giao dịch');
      loadTransaction();
    } catch (error) {
      console.error('Failed to cancel transaction:', error);
      alert('Không thể hủy giao dịch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!transactionId || !user?.id) return;

    try {
      setActionLoading(true);
      await transactionAPI.completeTransaction(user.id, transactionId);
      setShowRatingModal(true);
    } catch (error) {
      console.error('Failed to complete transaction:', error);
      alert('Không thể hoàn thành giao dịch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRate = async () => {
    if (!transactionId || !user?.id) return;

    try {
      setActionLoading(true);
      await transactionAPI.rateTransaction(user.id, transactionId, {
        rating,
        review,
      });
      alert('Cảm ơn bạn đã đánh giá!');
      setShowRatingModal(false);
      loadTransaction();
    } catch (error) {
      console.error('Failed to rate transaction:', error);
      alert('Không thể gửi đánh giá');
    } finally {
      setActionLoading(false);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      PAYMENT_PENDING: 'bg-purple-100 text-purple-800',
      PAYMENT_COMPLETED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: 'Chờ xác nhận',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
      PAYMENT_PENDING: 'Chờ thanh toán',
      PAYMENT_COMPLETED: 'Đã thanh toán',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy giao dịch</h2>
          <button
            onClick={() => navigate('/transactions')}
            className="text-blue-600 hover:text-blue-800"
          >
            Quay lại danh sách giao dịch
          </button>
        </div>
      </div>
    );
  }

  const isBuyer = transaction.buyerId === user?.id;
  const isSeller = transaction.sellerId === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chi tiết giao dịch</h1>
              <p className="text-gray-600">Mã GD: #{transaction.id}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                transaction.status
              )}`}
            >
              {getStatusText(transaction.status)}
            </span>
          </div>
        </div>

        {/* Item Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>
          <div className="flex gap-4">
            {transaction.itemImage && (
              <img
                src={transaction.itemImage}
                alt={transaction.itemTitle}
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{transaction.itemTitle}</h3>
              <p className="text-gray-600 mb-2">{transaction.itemDescription}</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(transaction.amount)}
              </p>
              <button
                onClick={() => navigate(`/items/${transaction.itemId}`)}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Xem chi tiết sản phẩm →
              </button>
            </div>
          </div>
        </div>

        {/* Participants Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Thông tin người tham gia</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Người mua</h3>
              <p className="text-lg">{transaction.buyerName}</p>
              <p className="text-gray-600">{transaction.buyerEmail}</p>
              {isSeller && (
                <button
                  onClick={() => navigate(`/profile/${transaction.buyerId}`)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem profile →
                </button>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Người bán</h3>
              <p className="text-lg">{transaction.sellerName}</p>
              <p className="text-gray-600">{transaction.sellerEmail}</p>
              {isBuyer && (
                <button
                  onClick={() => navigate(`/profile/${transaction.sellerId}`)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem profile →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Lịch sử giao dịch</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Giao dịch được tạo</p>
                <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>
            
            {transaction.acceptedAt && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Người bán chấp nhận</p>
                  <p className="text-sm text-gray-600">{formatDate(transaction.acceptedAt)}</p>
                </div>
              </div>
            )}
            
            {transaction.paidAt && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Thanh toán hoàn tất</p>
                  <p className="text-sm text-gray-600">{formatDate(transaction.paidAt)}</p>
                </div>
              </div>
            )}
            
            {transaction.completedAt && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Giao dịch hoàn thành</p>
                  <p className="text-sm text-gray-600">{formatDate(transaction.completedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Hành động</h2>
          
          {transaction.status === 'PENDING' && isSeller && (
            <div className="flex gap-4">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Chấp nhận giao dịch
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Từ chối giao dịch
              </button>
            </div>
          )}

          {transaction.status === 'PENDING' && isBuyer && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Hủy giao dịch
            </button>
          )}

          {transaction.status === 'ACCEPTED' && isBuyer && (
            <button
              onClick={() => navigate(`/payment/${transaction.id}`)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thanh toán ngay
            </button>
          )}

          {transaction.status === 'PAYMENT_COMPLETED' && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Xác nhận đã nhận hàng
            </button>
          )}

          {transaction.status === 'COMPLETED' && !transaction.rated && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Đánh giá giao dịch
            </button>
          )}

          <button
            onClick={() => navigate(`/chat/${transaction.chatRoomId || ''}`)}
            className="w-full mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            💬 Nhắn tin với {isBuyer ? 'người bán' : 'người mua'}
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Từ chối giao dịch</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Đánh giá giao dịch</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-3xl"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Nhận xét của bạn (không bắt buộc)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Bỏ qua
              </button>
              <button
                onClick={handleRate}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailPage;
