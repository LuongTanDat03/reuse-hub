import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from "lucide-react";

export const ProfilePage = (): JSX.Element => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data cho thông tin cá nhân
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận XYZ, TP.HCM",
    joinDate: "15/03/2024",
    bio: "Tôi là một người yêu thích mua bán đồ cũ và tái sử dụng các sản phẩm."
  });

  const [editData, setEditData] = useState(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#3c75de] px-4 py-8">
      {/* Header với Logo */}
      <header className="flex items-center justify-between px-28 py-4 mb-8">
        <div className="text-5xl font-bold text-white">
          L<span className="text-yellow-400">O</span>GO
        </div>
        <Button
          variant="outline"
          className="bg-transparent border-white text-white hover:bg-white/10"
          onClick={() => navigate("/")}
        >
          Về trang chủ
        </Button>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex items-center gap-6 mb-6">
            {/* Avatar lớn */}
            <div className="w-24 h-24 bg-[#ffc204] rounded-full flex items-center justify-center border-[4px] border-[#214d8c] shadow-[5px_5px_0px_#0000001a]">
              <User className="w-12 h-12 text-black" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profileData.fullName}
              </h1>
              <p className="text-blue-200 text-lg mb-1">
                @{user?.username}
              </p>
              <p className="text-blue-300 text-sm">
                Thành viên từ {profileData.joinDate}
              </p>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-[#ffc204] text-black hover:bg-[#ffc204]/90 border-[3px] border-[#214d8c] shadow-[3px_3px_0px_#0000001a]"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-2">Giới thiệu</h3>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                className="w-full bg-white/10 border border-white/30 rounded-xl p-3 text-white placeholder:text-white/70 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 resize-none"
                rows={3}
                placeholder="Viết giới thiệu về bản thân..."
              />
            ) : (
              <p className="text-blue-200 leading-relaxed">
                {profileData.bio}
              </p>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-400" />
              Thông tin cá nhân
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium text-sm mb-1 block">
                  Họ và tên
                </label>
                {isEditing ? (
                  <Input
                    value={editData.fullName}
                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-blue-200">{profileData.fullName}</p>
                )}
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-1 block">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-blue-200 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {profileData.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-1 block">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-blue-200 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {profileData.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-1 block">
                  Địa chỉ
                </label>
                {isEditing ? (
                  <Input
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-blue-200 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profileData.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thống kê */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
              Thống kê hoạt động
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-blue-200">Sản phẩm đã đăng</span>
                <span className="text-white font-bold text-lg">12</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-blue-200">Sản phẩm đã mua</span>
                <span className="text-white font-bold text-lg">8</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-blue-200">Đánh giá trung bình</span>
                <span className="text-white font-bold text-lg">4.8 ⭐</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-blue-200">Ngày tham gia</span>
                <span className="text-white font-bold text-lg">{profileData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-8">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10 px-8"
          >
            <X className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
};
