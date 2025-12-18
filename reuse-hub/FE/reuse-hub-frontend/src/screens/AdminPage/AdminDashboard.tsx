import { useState, useEffect, useMemo } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, Ban, CheckCircle, Trash2, Key, Filter, Wallet, Shield } from 'lucide-react';
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
import { getAllCategories } from '../../api/item';
import { ModerationPage } from './ModerationPage';
import { KycManagementPage } from './KycManagementPage';

type TabType = 'users' | 'items' | 'transactions' | 'moderation' | 'kyc';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);
  
  // Users data
  const [usersData, setUsersData] = useState<DashboardUserResponse | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  
  // Items data
  const [itemsData, setItemsData] = useState<DashboardItemResponse | null>(null);
  const [itemsPage, setItemsPage] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Transactions data
  const [transactionsData, setTransactionsData] = useState<DashboardTransactionResponse | null>(null);
  const [transactionsPage, setTransactionsPage] = useState(0);

  // Calculate total wallet from users data
  const totalWallet = useMemo(() => {
    if (!usersData?.users?.content) return 0;
    return usersData.users.content.reduce((sum, user) => sum + (user.wallet || 0), 0);
  }, [usersData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Fetch users
  const fetchUsers = async (page: number = 0) => {
    setLoading(true);
    try {
      const response = await getAllUsers(page, 10);
      console.log('Users response:', response);
      const data = response.data?.data || response.data;
      setUsersData(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items
  const fetchItems = async (page: number = 0, categoryFilter?: string) => {
    setLoading(true);
    try {
      console.log('Fetching items with categoryFilter:', categoryFilter);
      const response = await getAllItems(page, 10, 'createdAt', 'desc', undefined, categoryFilter);
      console.log('Items response:', response);
      console.log('Items data:', response.data);
      
      // Handle different response structures
      const data = response.data?.data || response.data;
      console.log('Processed data:', data);
      setItemsData(data);
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
      console.log('Transactions response:', response);
      const data = response.data?.data || response.data;
      setTransactionsData(data);
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
      fetchItems(itemsPage, selectedCategory);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(usersPage);
    } else if (activeTab === 'items') {
      fetchItems(itemsPage, selectedCategory);
    } else if (activeTab === 'transactions') {
      fetchTransactions(transactionsPage);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Quản lý người dùng, sản phẩm và giao dịch</p>
            </div>  
          </div>
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
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'moderation'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Kiểm duyệt
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'kyc'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Xác minh KYC
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
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ví</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
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
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-green-600">
                                {formatCurrency(user.wallet || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                (user as any).status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                (user as any).status === 'DISABLED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(user as any).status || 'ACTIVE'}
                              </span>
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
                <div className="mb-6 bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <div className="flex-1 flex gap-4 items-center">
                      {/* Category Filter */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lọc theo danh mục
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Tất cả danh mục</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.slug}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Apply Button */}
                      <div className="pt-7">
                        <Button
                          onClick={() => {
                            setItemsPage(0);
                            fetchItems(0, selectedCategory);
                          }}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                {itemsData.items.content.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
                    {selectedCategory && (
                      <p className="text-gray-400 text-sm mt-2">
                        Thử xóa bộ lọc để xem tất cả sản phẩm
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tiêu đề</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
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
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {(item.price || 0).toLocaleString('vi-VN')} đ
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
                            <td className="px-6 py-4 text-sm text-gray-600">{item.viewCount || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.likeCount || 0}</td>
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
                          fetchItems(itemsPage - 1, selectedCategory);
                        }}
                        disabled={itemsData.items.pageNo === 0}
                        className="px-4 py-2 text-sm"
                      >
                        Trước
                      </Button>
                      <Button
                        onClick={() => {
                          setItemsPage(itemsPage + 1);
                          fetchItems(itemsPage + 1, selectedCategory);
                        }}
                        disabled={itemsData.items.last}
                        className="px-4 py-2 text-sm"
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Moderation Tab */}
            {activeTab === 'moderation' && (
              <ModerationPage />
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <KycManagementPage />
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
                              {(transaction.itemPrice || 0).toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.quantity || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {(transaction.totalPrice || 0).toLocaleString('vi-VN')} đ
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
