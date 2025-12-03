import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as paymentAPI from '../../api/payment';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user?.id) {
      loadPayments();
    }
  }, [user?.id, currentPage, filter]);

  const loadPayments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await paymentAPI.getUserPayments(
        user.id,
        currentPage,
        20,
        filter !== 'ALL' ? filter : undefined
      );

      if (response.status === 200 && response.data) {
        setPayments(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
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
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang xử lý',
      COMPLETED: 'Hoàn thành',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền',
    };
    return texts[status] || status;
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method?.includes('card')) {
      return '💳';
    }
    return '💰';
  };

  const filters = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'FAILED', label: 'Thất bại' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">Lịch sử thanh toán</h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các giao dịch thanh toán của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Đang tải..." />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2">Chưa có giao dịch thanh toán</h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa thực hiện giao dịch thanh toán nào
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <>
            {/* Payments List */}
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{getPaymentMethodIcon(payment.paymentMethod)}</div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            Thanh toán #{payment.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(payment.createdAt)}
                          </p>
                          {payment.transactionId && (
                            <button
                              onClick={() => navigate(`/transactions/${payment.transactionId}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                            >
                              Xem giao dịch →
                            </button>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Số tiền</p>
                          <p className="font-semibold text-lg text-blue-600">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phương thức</p>
                          <p className="font-medium">
                            {payment.paymentMethod === 'card' ? 'Thẻ' : payment.paymentMethod}
                          </p>
                        </div>

                        {payment.stripePaymentIntentId && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Mã Stripe</p>
                            <p className="font-mono text-sm">
                              {payment.stripePaymentIntentId.slice(0, 20)}...
                            </p>
                          </div>
                        )}

                        {payment.completedAt && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                            <p className="text-sm">{formatDate(payment.completedAt)}</p>
                          </div>
                        )}
                      </div>

                      {payment.failureReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">
                            <strong>Lý do thất bại:</strong> {payment.failureReason}
                          </p>
                        </div>
                      )}

                      {payment.refundedAt && (
                        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-600">
                            <strong>Đã hoàn tiền:</strong> {formatDate(payment.refundedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      {payment.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            // TODO: Implement download receipt
                            alert('Tính năng tải hóa đơn đang được phát triển');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          📄 Tải hóa đơn
                        </button>
                      )}
                      
                      {payment.status === 'FAILED' && payment.transactionId && (
                        <button
                          onClick={() => navigate(`/payment/${payment.transactionId}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Thử lại thanh toán
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            {/* Summary */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Tổng quan</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {payments.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Thất bại</p>
                  <p className="text-2xl font-bold text-red-600">
                    {payments.filter(p => p.status === 'FAILED').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(
                      payments
                        .filter(p => p.status === 'COMPLETED')
                        .reduce((sum, p) => sum + p.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
