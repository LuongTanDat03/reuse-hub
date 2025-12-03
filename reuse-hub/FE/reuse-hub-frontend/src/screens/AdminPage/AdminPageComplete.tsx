import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as adminAPI from '../../api/admin';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';

const AdminPageComplete: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'items' | 'transactions' | 'reports'>('dashboard');
  
  // Dashboard state
  const [statistics, setStatistics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersStatus, setUsersStatus] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Items state
  const [items, setItems] = useState<any[]>([]);
  const [itemsPage, setItemsPage] = useState(0);
  const [itemsTotalPages, setItemsTotalPages] = useState(0);
  const [itemsSearch, setItemsSearch] = useState('');
  const [itemsStatus, setItemsStatus] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(0);
  const [transactionsStatus, setTransactionsStatus] = useState('');
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Reports state
  const [reports, setReports] = useState<any[]>([]);
  const [reportsPage, setReportsPage] = useState(0);
  const [reportsTotalPages, setReportsTotalPages] = useState(0);
  const [reportsType, setReportsType] = useState('');
  const [reportsStatus, setReportsStatus] = useState('PENDING');
  const [loadingReports, setLoadingReports] = useState(false);

  // Modal state
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');

  useEffect(() => {
    // Check admin permission
    if (!user?.roles?.includes('ADMIN')) {
      alert('Bạn không có quyền truy cập trang này');
      navigate('/');
      return;
    }

    loadStatistics();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'items') loadItems();
    else if (activeTab === 'transactions') loadTransactions();
    else if (activeTab === 'reports') loadReports();
  }, [activeTab, usersPage, usersSearch, usersStatus, itemsPage, itemsSearch, itemsStatus, transactionsPage, transactionsStatus, reportsPage, reportsType, reportsStatus]);

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const response = await adminAPI.getStatistics();
      if (response.status === 200) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminAPI.getAllUsers(usersPage, 20, usersSearch, usersStatus);
      if (response.status === 200 && response.data) {
        setUsers(response.data.content || []);
        setUsersTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      const response = await adminAPI.getAllItemsAdmin(itemsPage, 20, itemsSearch, itemsStatus);
      if (response.status === 200 && response.data) {
        setItems(response.data.content || []);
        setItemsTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await adminAPI.getAllTransactionsAdmin(transactionsPage, 20, transactionsStatus);
      if (response.status === 200 && response.data) {
        setTransactions(response.data.content || []);
        setTransactionsTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      const response = await adminAPI.getReports(reportsPage, 20, reportsType, reportsStatus);
      if (response.status === 200 && response.data) {
        setReports(response.data.content || []);
        setReportsTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      alert('Vui lòng nhập lý do ban');
      return;
    }

    try {
      await adminAPI.banUser(selectedUser.id, {
        reason: banReason,
        duration: banDuration ? parseInt(banDuration) : undefined,
      });
      alert('Đã ban user thành công');
      setShowBanModal(false);
      setBanReason('');
      setBanDuration('');
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Không thể ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn unban user này?')) return;

    try {
      await adminAPI.unbanUser(userId);
      alert('Đã unban user thành công');
      loadUsers();
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('Không thể unban user');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa item này?')) return;

    try {
      await adminAPI.deleteItemAdmin(itemId);
      alert('Đã xóa item thành công');
      loadItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Không thể xóa item');
    }
  };

  const handleResolveReport = async (reportId: string, action: 'APPROVE' | 'REJECT') => {
    const note = prompt(`Ghi chú (${action === 'APPROVE' ? 'Chấp nhận' : 'Từ chối'}):`);
    if (note === null) return;

    try {
      await adminAPI.resolveReport(reportId, action, note);
      alert(`Đã ${action === 'APPROVE' ? 'chấp nhận' : 'từ chối'} báo cáo`);
      loadReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
      alert('Không thể xử lý báo cáo');
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

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'items' as const, label: 'Items', icon: '📦' },
    { id: 'transactions' as const, label: 'Transactions', icon: '💰' },
    { id: 'reports' as const, label: 'Reports', icon: '🚨' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Quản lý hệ thống ReuseHub</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {loadingStats ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Đang tải thống kê..." />
              </div>
            ) : statistics ? (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tổng Users</p>
                        <p className="text-3xl font-bold">{statistics.overview?.totalUsers || 0}</p>
                      </div>
                      <div className="text-4xl">👥</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tổng Items</p>
                        <p className="text-3xl font-bold">{statistics.overview?.totalItems || 0}</p>
                      </div>
                      <div className="text-4xl">📦</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tổng Giao dịch</p>
                        <p className="text-3xl font-bold">{statistics.overview?.totalTransactions || 0}</p>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
                        <p className="text-2xl font-bold">{formatCurrency(statistics.overview?.totalRevenue || 0)}</p>
                      </div>
                      <div className="text-4xl">💵</div>
                    </div>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">User Growth</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      Chart placeholder - Implement với Chart.js hoặc Recharts
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Revenue Statistics</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      Chart placeholder - Implement với Chart.js hoặc Recharts
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không thể tải thống kê
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            {/* Filters */}
            <div className="p-6 border-b">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Tìm kiếm user..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={usersStatus}
                  onChange={(e) => setUsersStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              user.status === 'BANNED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {user.status !== 'BANNED' ? (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowBanModal(true);
                                  }}
                                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                >
                                  Ban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                  Unban
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/profile/${user.id}`)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {usersTotalPages > 1 && (
                  <div className="p-6 border-t">
                    <Pagination
                      currentPage={usersPage}
                      totalPages={usersTotalPages}
                      onPageChange={setUsersPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={itemsSearch}
                  onChange={(e) => setItemsSearch(e.target.value)}
                  placeholder="Tìm kiếm item..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={itemsStatus}
                  onChange={(e) => setItemsStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="DELETED">Deleted</option>
                </select>
              </div>
            </div>

            {loadingItems ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.images?.[0] && (
                                <img src={item.images[0]} alt="" className="w-12 h-12 object-cover rounded" />
                              )}
                              <div className="font-medium">{item.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">{formatCurrency(item.price)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.userEmail}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                              item.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/items/${item.id}`)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {itemsTotalPages > 1 && (
                  <div className="p-6 border-t">
                    <Pagination
                      currentPage={itemsPage}
                      totalPages={itemsTotalPages}
                      onPageChange={setItemsPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Similar structure for Transactions and Reports tabs... */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Transactions management - Similar to items table</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Reports management - Similar to items table</p>
          </div>
        )}
      </div>

      {/* Ban User Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => {
          setShowBanModal(false);
          setSelectedUser(null);
          setBanReason('');
          setBanDuration('');
        }}
        title="Ban User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do ban <span className="text-red-500">*</span>
            </label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
              placeholder="Nhập lý do ban user..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian ban (ngày)
            </label>
            <input
              type="number"
              value={banDuration}
              onChange={(e) => setBanDuration(e.target.value)}
              placeholder="Để trống = vĩnh viễn"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Để trống để ban vĩnh viễn
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => {
                setShowBanModal(false);
                setSelectedUser(null);
                setBanReason('');
                setBanDuration('');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleBanUser}
              disabled={!banReason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Xác nhận Ban
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPageComplete;
