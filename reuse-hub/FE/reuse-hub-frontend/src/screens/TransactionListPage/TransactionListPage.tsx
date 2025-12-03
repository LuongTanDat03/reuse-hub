import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as transactionAPI from '../../api/transaction';

const TransactionListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user?.id, activeTab, filter]);

  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await transactionAPI.getUserTransactions(
        user.id,
        activeTab === 'buying' ? 'BUYER' : 'SELLER',
        0,
        20,
        filter !== 'ALL' ? filter : undefined
      );

      if (response.status === 200 && response.data) {
        setTransactions(response.data.content || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
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

  const filters = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'ACCEPTED', label: 'Đã chấp nhận' },
    { value: 'PAYMENT_PENDING', label: 'Chờ thanh toán' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Quản lý giao dịch</h1>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('buying')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'buying'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đang mua
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'selling'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đang bán
            </button>
          </div>
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

        {/* Transactions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Chưa có giao dịch</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'buying'
                ? 'Bạn chưa có giao dịch mua nào'
                : 'Bạn chưa có giao dịch bán nào'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/transactions/${transaction.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    {transaction.itemImage && (
                      <img
                        src={transaction.itemImage}
                        alt={transaction.itemTitle}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {transaction.itemTitle}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {activeTab === 'buying'
                              ? `Người bán: ${transaction.sellerName}`
                              : `Người mua: ${transaction.buyerName}`}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusText(transaction.status)}
                        </span>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-600">
                          <p>Mã GD: #{transaction.id.slice(0, 8)}</p>
                          <p>Ngày tạo: {formatDate(transaction.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {transaction.status === 'PENDING' && activeTab === 'selling' && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/transactions/${transaction.id}`);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Chấp nhận
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/transactions/${transaction.id}`);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}

                      {transaction.status === 'ACCEPTED' && activeTab === 'buying' && (
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/payment/${transaction.id}`);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Thanh toán ngay
                          </button>
                        </div>
                      )}

                      {transaction.status === 'PAYMENT_COMPLETED' && (
                        <div className="mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/transactions/${transaction.id}`);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Xác nhận hoàn thành
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionListPage;
