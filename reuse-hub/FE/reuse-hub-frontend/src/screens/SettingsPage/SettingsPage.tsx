import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    transaction: true,
    message: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handlePrivacyChange = (key: string) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement change password API
      alert('Đổi mật khẩu thành công!');
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert('Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement delete account API
      await logout();
      navigate('/');
    } catch (error) {
      alert('Không thể xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold">Cài đặt</h1>
          <p className="text-gray-600 mt-1">Quản lý tài khoản và tùy chọn của bạn</p>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tài khoản</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Thay đổi
              </button>
            </div>

            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Mật khẩu</p>
                <p className="text-sm text-gray-600">••••••••</p>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Đổi mật khẩu
              </button>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Chỉnh sửa profile</p>
                <p className="text-sm text-gray-600">Cập nhật thông tin cá nhân</p>
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Thông báo</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Thông báo qua Email</p>
                <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Thông báo Push</p>
                <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Giao dịch</p>
                <p className="text-sm text-gray-600">Thông báo về giao dịch mua bán</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.transaction}
                  onChange={() => handleNotificationChange('transaction')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Tin nhắn</p>
                <p className="text-sm text-gray-600">Thông báo tin nhắn mới</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.message}
                  onChange={() => handleNotificationChange('message')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Marketing</p>
                <p className="text-sm text-gray-600">Nhận tin khuyến mãi và ưu đãi</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={() => handleNotificationChange('marketing')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Quyền riêng tư</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Hiển thị Email</p>
                <p className="text-sm text-gray-600">Cho phép người khác xem email của bạn</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={() => handlePrivacyChange('showEmail')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Hiển thị số điện thoại</p>
                <p className="text-sm text-gray-600">Cho phép người khác xem số điện thoại</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={() => handlePrivacyChange('showPhone')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Cho phép tin nhắn</p>
                <p className="text-sm text-gray-600">Người khác có thể nhắn tin cho bạn</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.allowMessages}
                  onChange={() => handlePrivacyChange('allowMessages')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Vùng nguy hiểm</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Xóa tài khoản</p>
                <p className="text-sm text-gray-600">
                  Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        title="Đổi mật khẩu"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowChangePasswordModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Xóa tài khoản"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
            </p>
          </div>

          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa tài khoản? Điều này sẽ xóa:
          </p>

          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Tất cả sản phẩm của bạn</li>
            <li>Lịch sử giao dịch</li>
            <li>Tin nhắn và thông báo</li>
            <li>Thông tin cá nhân</li>
          </ul>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
