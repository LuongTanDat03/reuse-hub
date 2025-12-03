import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, Ban, CheckCircle, Trash2, Key } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  getAllUsers,
  getAllItems,
  getAllTransactions,
  blockUser,
  unblockUser,
  resetPassword,
  deleteItem,
  DashboardUserResponse,
  DashboardItemResponse,
  DashboardTransactionResponse,
} from '../../api/admin';

type TabType = 'users' | 'items' | 'transactions';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);
  
  // Users data
  const [usersData, setUsersData] = useState<DashboardUserResponse | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  
  // Items data
  const [itemsData, setItemsData] = useState<DashboardItemResponse | null>(null);
  const [itemsPage, setItemsPage] = useState(0);
  const [itemsFilter, setItemsFilter] = useState<string>('');
  
  // Transactions data
  const [transactionsData, setTransactionsData] = useState<DashboardTransactionResponse | null>(null);
  const [transactionsPage, setTransactionsPage] = useState(0);

  // Fetch users
  const fetchUsers = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await getAllUsers(page, 10);
      setUsersData(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items
  const fetchItems = async (page: number = 0, filter?: string) => {
    setLoading(true);
    try {
      const response = await getAllItems(page, 10, 'createdAt', 'desc', filter);
      setItemsData(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions
  const fetchTransactions = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await getAllTransactions(page, 10);
      setTransactionsData(response.data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle user actions
  const handleBlockUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn chặn người dùng này?')) return;
    try {
      await blockUser(userId);
      fetchUsers(usersPage);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await unblockUser(userId);
      fetchUsers(usersPage);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn reset mật khẩu người dùng này?')) return;
    try {
      await resetPassword(userId);
      alert('Đã reset mật khẩu thành công!');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  // Handle item actions
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteItem(itemId);
      fetchItems(itemsPage, itemsFilter);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(usersPage);
    } else if (activeTab === 'items') {
      fetchItems(itemsPage, itemsFilter);
    } else if (activeTab === 'transactions') {
      fetchTransactions(transactionsPage);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Quản lý người dùng, sản phẩm và giao dịch</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'items'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5 inline mr-2" />
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            Giao dịch
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === 'users' && usersData && (
              <div>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Tổng người dùng</p>
                        <p className="text-3xl font-bold text-gray-900">{usersData.statistics.totalUsers}</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-500" />
                    </div>
                  </div>
                  {Object.entries(usersData.statistics.userStats).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm capitalize">{key}</p>
                          <p className="text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avatar</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Username</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Họ tên</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {usersData.users.content.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <img
                                src={user.avatarUrl || '/default-avatar.png'}
                                alt={user.username}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  onClick={() => handleBlockUser(user.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                  title="Chặn"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleUnblockUser(user.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                                  title="Mở chặn"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleResetPassword(user.id)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
                                  title="Reset mật khẩu"
                                >
                                  <Key className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Trang {usersData.users.pageNo + 1} / {usersData.users.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setUsersPage(usersPage - 1);
                          fetchUsers(usersPage - 1);
                        }}
                        disabled={usersData.users.pageNo === 0}
                        className="px-4 py-2 text-sm"
                      >
                        Trước
                      </Button>
                      <Button
                        onClick={() => {
                          setUsersPage(usersPage + 1);
                          fetchUsers(usersPage + 1);
                        }}
                        disabled={usersData.users.last}
                        className="px-4 py-2 text-sm"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Items Tab */}
            {activeTab === 'items' && itemsData && (
              <div>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Tổng sản phẩm</p>
                        <p className="text-3xl font-bold text-gray-900">{itemsData.statistics.totalItems}</p>
                      </div>
                      <Package className="w-12 h-12 text-purple-500" />
                    </div>
                  </div>
                  {Object.entries(itemsData.statistics.itemStats).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm capitalize">{key}</p>
                          <p className="text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-orange-500" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filter */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Lọc theo status..."
                    value={itemsFilter}
                    onChange={(e) => setItemsFilter(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        fetchItems(0, itemsFilter);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => fetchItems(0, itemsFilter)}
                    className="ml-2 px-4 py-2"
                  >
                    Lọc
                  </Button>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tiêu đề</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Likes</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {itemsData.items.content.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <img
                                src={item.images[0] || '/placeholder.png'}
                                alt={item.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {item.price.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                item.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.viewCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.likeCount}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Trang {itemsData.items.pageNo + 1} / {itemsData.items.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setItemsPage(itemsPage - 1);
                          fetchItems(itemsPage - 1, itemsFilter);
                        }}
                        disabled={itemsData.items.pageNo === 0}
                        className="px-4 py-2 text-sm"
                      >
                        Trước
                      </Button>
                      <Button
                        onClick={() => {
                          setItemsPage(itemsPage + 1);
                          fetchItems(itemsPage + 1, itemsFilter);
                        }}
                        disabled={itemsData.items.last}
                        className="px-4 py-2 text-sm"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && transactionsData && (
              <div>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Tổng giao dịch</p>
                        <p className="text-3xl font-bold text-gray-900">{transactionsData.statistics.totalTransactions}</p>
                      </div>
                      <ShoppingCart className="w-12 h-12 text-indigo-500" />
                    </div>
                  </div>
                  {Object.entries(transactionsData.statistics.transactionStats).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm capitalize">{key}</p>
                          <p className="text-3xl font-bold text-gray-900">{value}</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-pink-500" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số lượng</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Delivery</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactionsData.transactions.content.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={transaction.itemImageUrl || '/placeholder.png'}
                                  alt={transaction.itemTitle}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <span className="text-sm text-gray-900 max-w-xs truncate">{transaction.itemTitle}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {transaction.itemPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.quantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {transaction.totalPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{transaction.type}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{transaction.deliveryMethod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Trang {transactionsData.transactions.pageNo + 1} / {transactionsData.transactions.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setTransactionsPage(transactionsPage - 1);
                          fetchTransactions(transactionsPage - 1);
                        }}
                        disabled={transactionsData.transactions.pageNo === 0}
                        className="px-4 py-2 text-sm"
                      >
                        Trước
                      </Button>
                      <Button
                        onClick={() => {
                          setTransactionsPage(transactionsPage + 1);
                          fetchTransactions(transactionsPage + 1);
                        }}
                        disabled={transactionsData.transactions.last}
                        className="px-4 py-2 text-sm"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
