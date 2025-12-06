import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyTransactions,
  getBuyerTransactions,
  getSellerTransactions,
  confirmDelivery,
  completeTransaction,
  cancelTransaction,
  submitFeedback,
} from '../../api/transaction';
import { TransactionResponse } from '../../types/api';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

type TabType = 'all' | 'buying' | 'selling';

export const TransactionManagementPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
  
  // Form states
  const [trackingCode, setTrackingCode] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [activeTab, page, user?.id]);

  const fetchTransactions = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let response;
      if (activeTab === 'all') {
        response = await getMyTransactions(user.id, page, 20);
      } else if (activeTab === 'buying') {
        response = await getBuyerTransactions(user.id, page, 20);
      } else {
        response = await getSellerTransactions(user.id, page, 20);
      }
      
      if (response.status === 200 && response.data) {
        setTransactions(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!user?.id || !selectedTransaction || !trackingCode.trim()) {
      toast.error('Vui lòng nhập mã vận đơn');
      return;
    }

    try {
      const response = await confirmDelivery(user.id, selectedTransaction.id, trackingCode);
      if (response.status === 200) {
        toast.success('Đã xác nhận giao hàng!');
        setShowTrackingModal(false);
        setTrackingCode('');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('Không thể xác nhận giao hàng');
    }
  };

  const handleCompleteTransaction = async (transactionId: string) => {
    if (!user?.id) return;
    
    if (!confirm('Bạn đã nhận được hàng và xác nhận hoàn thành giao dịch?')) return;

    try {
      const response = await completeTransaction(user.id, transactionId);
      if (response.status === 200) {
        toast.success('Đã hoàn thành giao dịch!');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      toast.error('Không thể hoàn thành giao dịch');
    }
  };

  const handleCancelTransaction = async () => {
    if (!user?.id || !selectedTransaction || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      const response = await cancelTransaction(user.id, selectedTransaction.id, cancelReason);
      if (response.status === 200) {
        toast.success('Đã hủy giao dịch!');
        setShowCancelModal(false);
        setCancelReason('');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Không thể hủy giao dịch');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user?.id || !selectedTransaction) return;

    try {
      const response = await submitFeedback(user.id, selectedTransaction.id, {
        rating,
        comment,
      });
      if (response.status === 200) {
        toast.success('Đã gửi đánh giá!');
        setShowFeedbackModal(false);
        setRating(5);
        setComment('');
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Không thể gửi đánh giá');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDING':
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_DELIVERY':
      case 'DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PAYMENT_PENDING':
      case 'PAYMENT_COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="w-4 h-4" />;
      case 'IN_DELIVERY':
      case 'DELIVERY':
        return <Truck className="w-4 h-4" />;
      case 'PENDING':
      case 'CONFIRMED':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      RESERVED: 'Đã đặt trước',
      PAYMENT_PENDING: 'Chờ thanh toán',
      PAYMENT_COMPLETED: 'Đã thanh toán',
      IN_DELIVERY: 'Đang giao',
      DELIVERY: 'Đang vận chuyển',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
    };
    return statusMap[status] || status;
  };

  const canConfirmDelivery = (transaction: TransactionResponse) => {
    return (
      user?.id === transaction.sellerId &&
      (transaction.status === 'CONFIRMED' || 
       transaction.status === 'PAYMENT_COMPLETED')
    );
  };

  const canCompleteTransaction = (transaction: TransactionResponse) => {
    return (
      user?.id === transaction.buyerId &&
      (transaction.status === 'IN_DELIVERY' || 
       transaction.status === 'DELIVERY')
    );
  };

  const canPayment = (transaction: TransactionResponse) => {
    return (
      user?.id === transaction.buyerId &&
      (transaction.status === 'PENDING' || 
       transaction.status === 'PAYMENT_PENDING')
    );
  };

  const canCancelTransaction = (transaction: TransactionResponse) => {
    return (
      transaction.status !== 'COMPLETED' &&
      transaction.status !== 'CANCELLED' &&
      transaction.status !== 'REFUNDED'
    );
  };

  const canSubmitFeedback = (transaction: TransactionResponse) => {
    return (
      user?.id === transaction.buyerId &&
      transaction.status === 'COMPLETED' &&
      !transaction.buyerFeedback
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý Giao dịch</h1>
          <p className="text-gray-600">Theo dõi và cập nhật trạng thái giao dịch của bạn</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('all');
              setPage(0);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Tất cả
          </button>
          <button
            onClick={() => {
              setActiveTab('buying');
              setPage(0);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'buying'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            Đang mua
          </button>
          <button
            onClick={() => {
              setActiveTab('selling');
              setPage(0);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'selling'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Truck className="w-5 h-5 inline mr-2" />
            Đang bán
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <>
            {/* Transactions List */}
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={transaction.itemImageUrl || '/placeholder.png'}
                        alt={transaction.itemTitle}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {transaction.itemTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mã GD: {transaction.id.substring(0, 8)}...
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="text-sm font-semibold">
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Giá</p>
                          <p className="text-lg font-bold text-gray-900">
                            {(transaction.itemPrice || 0).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Số lượng</p>
                          <p className="text-lg font-bold text-gray-900">{transaction.quantity || 1}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tổng tiền</p>
                          <p className="text-lg font-bold text-red-600">
                            {(transaction.totalPrice || transaction.totalAmount || 0).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phương thức giao hàng</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {transaction.deliveryMethod}
                          </p>
                        </div>
                      </div>

                      {transaction.deliveryTrackingCode && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Mã vận đơn</p>
                          <p className="text-sm font-mono font-bold text-blue-600">
                            {transaction.deliveryTrackingCode}
                          </p>
                        </div>
                      )}

                      {transaction.buyerFeedback && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <p className="text-sm font-semibold text-gray-900">Đánh giá</p>
                          </div>
                          <p className="text-sm text-gray-700">{transaction.buyerFeedback}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {/* Buyer: Payment Button */}
                        {canPayment(transaction) && (
                          <Button
                            onClick={() => window.location.href = `/payment?transactionId=${transaction.id}&itemId=${transaction.itemId}&amount=${transaction.totalAmount || transaction.totalPrice || 0}`}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Thanh toán ngay
                          </Button>
                        )}

                        {/* Seller: Confirm Delivery */}
                        {canConfirmDelivery(transaction) && (
                          <Button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTrackingModal(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Xác nhận giao hàng
                          </Button>
                        )}

                        {/* Buyer: Complete Transaction */}
                        {canCompleteTransaction(transaction) && (
                          <Button
                            onClick={() => handleCompleteTransaction(transaction.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Đã nhận hàng
                          </Button>
                        )}

                        {/* Buyer: Submit Feedback */}
                        {canSubmitFeedback(transaction) && (
                          <Button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowFeedbackModal(true);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Đánh giá
                          </Button>
                        )}

                        {/* Cancel Transaction */}
                        {canCancelTransaction(transaction) && (
                          <Button
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowCancelModal(true);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Hủy giao dịch
                          </Button>
                        )}

                        {/* Refresh */}
                        <Button
                          onClick={fetchTransactions}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Làm mới
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2"
                >
                  Trước
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Trang {page + 1} / {totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}

        {/* Tracking Code Modal */}
        {showTrackingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Xác nhận giao hàng</h3>
              <p className="text-gray-600 mb-4">
                Nhập mã vận đơn để xác nhận bạn đã giao hàng cho đơn vị vận chuyển
              </p>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Nhập mã vận đơn..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmDelivery}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Xác nhận
                </Button>
                <Button
                  onClick={() => {
                    setShowTrackingModal(false);
                    setTrackingCode('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Đánh giá giao dịch</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Đánh giá</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Nhận xét</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitFeedback}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Gửi đánh giá
                </Button>
                <Button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setRating(5);
                    setComment('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Hủy giao dịch</h3>
              <p className="text-gray-600 mb-4">
                Vui lòng cho biết lý do hủy giao dịch
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCancelTransaction}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Xác nhận hủy
                </Button>
                <Button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
