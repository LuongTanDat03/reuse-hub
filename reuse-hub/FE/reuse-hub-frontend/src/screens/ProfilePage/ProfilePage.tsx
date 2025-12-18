import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Shield, CheckCircle } from "lucide-react";
import { getProfile, updateProfile } from "../../api/profile";
import { ProfileResponse, ProfileUpdateRequest } from "../../types/api";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export const ProfilePage = (): JSX.Element => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [editData, setEditData] = useState<ProfileUpdateRequest>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug logs removed to reduce noise in console

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        setIsLoading(true);
        try {
          const response = await getProfile(user.id);
          const raw: any = response?.data || {};
          
          // Safe access to firstName and lastName with defaults
          const firstName = raw?.firstName || '';
          const lastName = raw?.lastName || '';
          const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || raw?.fullName || '';
          
          const mapped = {
            ...raw,
            firstName,
            lastName,
            fullName,
            address: Array.isArray(raw?.address) ? raw.address : (raw?.address ? [raw.address] : []),
            email: raw?.email || '',
            phone: raw?.phone || '',
            joinDate: raw?.joinDate || new Date().toISOString(),
            bio: raw?.bio || '',
          };
          setProfileData(mapped as any);
          setEditData(mapped as any);
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          setError("Không thể tải thông tin hồ sơ.");
          toast.error("Không thể tải thông tin hồ sơ.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    } else {
      // Optionally redirect to login if no user is found
      navigate("/login");
    }
  }, [user?.id, navigate]);

  const handleEdit = () => {
    if (profileData) {
      setEditData(profileData);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Không có ID người dùng để cập nhật hồ sơ.");
      return;
    }

    // Validate trước khi lưu
    const isValid = validate();
    if (!isValid) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin.");
      return;
    }

    setIsLoading(true);
    try {
      // Chuẩn hóa address: BE yêu cầu mảng List<ProfileAddressRequest> trong field 'address'
      const payload: any = { ...editData };
      if (payload.address) {
        if (typeof payload.address === 'object') {
          // Nếu là array (chuẩn BE) giữ nguyên; nếu là object, wrap thành array
          if (Array.isArray(payload.address)) {
            const first = (payload.address as any[])[0] || {};
            const { addressLine, ward, district, city, country } = first as any;
            payload.address = [ { addressLine, ward, district, city, country } ];
          } else {
            const { addressLine, ward, district, city, country } = payload.address as any;
            payload.address = [ { addressLine, ward, district, city, country } ];
          }
        } else if (typeof payload.address === 'string') {
          const addressLine = payload.address as string;
          payload.address = [ { addressLine, ward: '', district: '', city: '', country: '' } ];
        }
      }

      // Backend requires userId inside request body (ProfileUpdateRequest)
      payload.userId = user.id;
      // Map fullName -> firstName/lastName nếu cần
      if (payload.fullName && (!payload.firstName || !payload.lastName)) {
        const parts = String(payload.fullName).trim().split(/\s+/);
        payload.firstName = parts[0] || '';
        payload.lastName = parts.slice(1).join(' ') || '';
      }

      const response = await updateProfile(user.id, payload, selectedFile);
      // Cập nhật ngay từ response
      const updatedRaw: any = response?.data ?? {};
      const updatedFirstName = updatedRaw?.firstName || '';
      const updatedLastName = updatedRaw?.lastName || '';
      const updatedFullName = [updatedFirstName, updatedLastName].filter(Boolean).join(' ').trim() || updatedRaw?.fullName || '';
      
      const updatedMapped = {
        ...updatedRaw,
        firstName: updatedFirstName,
        lastName: updatedLastName,
        fullName: updatedFullName,
        address: Array.isArray(updatedRaw?.address) ? updatedRaw.address : (updatedRaw?.address ? [updatedRaw.address] : []),
        email: updatedRaw?.email || '',
        phone: updatedRaw?.phone || '',
        joinDate: updatedRaw?.joinDate || new Date().toISOString(),
        bio: updatedRaw?.bio || '',
      };
      setProfileData(updatedMapped as any);
      setEditData(updatedMapped as any);
      // Cache avatarUrl for header
      if ((updatedMapped as any)?.avatarUrl) {
        localStorage.setItem('avatarUrl', (updatedMapped as any).avatarUrl);
      }
      // Re-fetch để đồng bộ hoàn toàn với DB
      try {
        const refreshed = await getProfile(user.id);
        const refRaw: any = refreshed?.data ?? {};
        const refFirstName = refRaw?.firstName || '';
        const refLastName = refRaw?.lastName || '';
        const refFullName = [refFirstName, refLastName].filter(Boolean).join(' ').trim() || refRaw?.fullName || '';
        
        const refMapped = {
          ...refRaw,
          firstName: refFirstName,
          lastName: refLastName,
          fullName: refFullName,
          address: Array.isArray(refRaw?.address) ? refRaw.address : (refRaw?.address ? [refRaw.address] : []),
          email: refRaw?.email || '',
          phone: refRaw?.phone || '',
          joinDate: refRaw?.joinDate || new Date().toISOString(),
          bio: refRaw?.bio || '',
        };
        setProfileData(refMapped as any);
        setEditData(refMapped as any);
        if ((refMapped as any)?.avatarUrl) {
          localStorage.setItem('avatarUrl', (refMapped as any).avatarUrl);
        }
      } catch (_) {
        // bỏ qua nếu refetch lỗi tạm thời
      }
      setIsEditing(false);
      setSelectedFile(undefined);
      setPreview(null);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Cập nhật hồ sơ thất bại.");
      toast.error("Cập nhật hồ sơ thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && !confirm("Bạn có chắc muốn hủy? Thay đổi sẽ không được lưu.")) {
      return;
    }
    if (profileData) {
      setEditData(profileData);
    }
    setIsEditing(false);
    setSelectedFile(undefined);
    setPreview(null);
    setErrors({});
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatAddress = (address: any): string => {
    if (!address) return "Chưa cập nhật";
    // Hỗ trợ string, object hoặc array từ BE
    if (typeof address === 'string') return address || "Chưa cập nhật";
    if (Array.isArray(address)) {
      const first = address[0];
      if (!first) return "Chưa cập nhật";
      const { addressLine, ward, district, city, country } = first as Record<string, string>;
      return [addressLine, ward, district, city, country].filter(Boolean).join(', ') || "Chưa cập nhật";
    }
    const { addressLine, ward, district, city, country } = address as Record<string, string>;
    return [addressLine, ward, district, city, country].filter(Boolean).join(', ') || "Chưa cập nhật";
  };

  // Validation
  const validate = (): boolean => {
    const vErrors: Record<string, string> = {};
    if (!editData.fullName || !editData.fullName.trim()) {
      vErrors.fullName = "Vui lòng nhập họ tên";
    }
    if (editData.email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(editData.email)) {
      vErrors.email = "Email không hợp lệ";
    }
    if (editData.phone && !/^0\d{9}$/.test(editData.phone)) {
      vErrors.phone = "Số điện thoại không hợp lệ";
    }
    setErrors(vErrors);
    return Object.keys(vErrors).length === 0;
  };

  // Dirty check (so sánh dữ liệu hiện chỉnh sửa với dữ liệu gốc)
  const isDirty = useMemo(() => {
    if (!profileData) return false;
    const base = {
      fullName: profileData.fullName || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      bio: profileData.bio || "",
      address: typeof profileData.address === 'object'
        ? JSON.stringify({
            addressLine: profileData.address?.addressLine || "",
            ward: profileData.address?.ward || "",
            district: profileData.address?.district || "",
            city: profileData.address?.city || "",
            country: profileData.address?.country || "",
          })
        : (profileData.address || ""),
    };
    const current = {
      fullName: editData.fullName || "",
      email: editData.email || "",
      phone: editData.phone || "",
      bio: editData.bio || "",
      address: typeof editData.address === 'object'
        ? JSON.stringify({
            addressLine: (editData.address as any)?.addressLine || "",
            ward: (editData.address as any)?.ward || "",
            district: (editData.address as any)?.district || "",
            city: (editData.address as any)?.city || "",
            country: (editData.address as any)?.country || "",
          })
        : (typeof editData.address === 'string' ? (editData.address || "") : ""),
    };
    const changed = JSON.stringify(base) !== JSON.stringify(current);
    return changed || !!selectedFile;
  }, [profileData, editData, selectedFile]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#3c75de] flex items-center justify-center text-white text-xl">Đang tải hồ sơ...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#3c75de] flex items-center justify-center text-red-400 text-xl">Lỗi: {error}</div>;
  }

  if (!profileData) {
    return <div className="min-h-screen bg-[#3c75de] flex items-center justify-center text-white text-xl">Không tìm thấy thông tin hồ sơ.</div>;
  }

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
            <div className="w-24 h-24 bg-[#ffc204] rounded-full flex items-center justify-center border-[4px] border-[#214d8c] shadow-[5px_5px_0px_#0000001a] overflow-hidden">
              {preview ? (
                <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
              ) : (profileData as any).avatarUrl ? (
                <img src={(profileData as any).avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-black" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {profileData.fullName}
              </h1>
              <p className="text-blue-200 text-lg mb-1">
                @{user?.username}
              </p>
              <p className="text-blue-300 text-sm">
                Thành viên từ {formatDate(profileData.joinDate)}
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
                  <input type="file" onChange={handleFileChange} className="hidden" id="avatar-upload" />
                  <label htmlFor="avatar-upload" className="cursor-pointer bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md flex items-center justify-center">
                    Chọn ảnh
                  </label>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !isDirty || Object.keys(errors).length > 0}
                    className="bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Đang lưu..." : "Lưu"}
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

          {/* Bỏ phần Giới thiệu vì BE không có trường 'bio' */}
        </div>

        {/* Lỗi chung */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-500/10 border border-red-400 text-red-200 rounded-xl p-3 mb-6">
            Vui lòng kiểm tra lại các trường được đánh dấu.
          </div>
        )}

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Thông tin cá nhân */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-yellow-400" />
              Thông tin cá nhân
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-medium text-sm mb-1 block">Họ (firstName)</label>
                  {isEditing ? (
                    <Input
                      value={(editData as any).firstName || ""}
                      onChange={(e) => setEditData({ ...(editData as any), firstName: e.target.value, fullName: undefined })}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                    />
                  ) : (
                    <p className="text-blue-200">{(profileData as any).firstName || ""}</p>
                  )}
                </div>
                <div>
                  <label className="text-white font-medium text-sm mb-1 block">Tên (lastName)</label>
                  {isEditing ? (
                    <Input
                      value={(editData as any).lastName || ""}
                      onChange={(e) => setEditData({ ...(editData as any), lastName: e.target.value, fullName: undefined })}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                    />
                  ) : (
                    <p className="text-blue-200">{(profileData as any).lastName || ""}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-1 block">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "error-email" : undefined}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-blue-200 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {profileData.email}
                  </p>
                )}
                {errors.email && (
                  <p id="error-email" className="mt-1 text-xs text-red-300">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-white font-medium text-sm mb-1 block">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editData.phone || ""}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "error-phone" : undefined}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                  />
                ) : (
                  <p className="text-blue-200 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {profileData.phone}
                  </p>
                )}
                {errors.phone && (
                  <p id="error-phone" className="mt-1 text-xs text-red-300">{errors.phone}</p>
                )}
              </div>

               <div>
                 <label className="text-white font-medium text-sm mb-1 block">Địa chỉ</label>
                 {isEditing ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input
                       placeholder="Địa chỉ"
                       value={Array.isArray(editData.address) ? ((editData.address[0] as any)?.addressLine || "") : (typeof editData.address === 'object' ? (editData.address as any).addressLine || "" : typeof editData.address === 'string' ? editData.address : "")}
                       onChange={(e) => {
                         const base = Array.isArray(editData.address) ? (editData.address[0] as any) || {} : (typeof editData.address === 'object' ? (editData.address as any) : {});
                         const next = { ...base, addressLine: e.target.value };
                         setEditData({
                           ...editData,
                           address: [ next ],
                         } as any);
                       }}
                       className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                     />
                     <Input
                       placeholder="Phường/Xã (ward)"
                       value={Array.isArray(editData.address) ? ((editData.address[0] as any)?.ward || "") : (typeof editData.address === 'object' ? (editData.address as any).ward || "" : "")}
                       onChange={(e) => {
                         const base = Array.isArray(editData.address) ? (editData.address[0] as any) || {} : (typeof editData.address === 'object' ? (editData.address as any) : {});
                         const next = { ...base, ward: e.target.value };
                         setEditData({ ...editData, address: [ next ] } as any);
                       }}
                       className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                     />
                     <Input
                       placeholder="Quận/Huyện (district)"
                       value={Array.isArray(editData.address) ? ((editData.address[0] as any)?.district || "") : (typeof editData.address === 'object' ? (editData.address as any).district || "" : "")}
                       onChange={(e) => {
                         const base = Array.isArray(editData.address) ? (editData.address[0] as any) || {} : (typeof editData.address === 'object' ? (editData.address as any) : {});
                         const next = { ...base, district: e.target.value };
                         setEditData({ ...editData, address: [ next ] } as any);
                       }}
                       className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                     />
                     <Input
                       placeholder="Thành phố (city)"
                       value={Array.isArray(editData.address) ? ((editData.address[0] as any)?.city || "") : (typeof editData.address === 'object' ? (editData.address as any).city || "" : "")}
                       onChange={(e) => {
                         const base = Array.isArray(editData.address) ? (editData.address[0] as any) || {} : (typeof editData.address === 'object' ? (editData.address as any) : {});
                         const next = { ...base, city: e.target.value };
                         setEditData({ ...editData, address: [ next ] } as any);
                       }}
                       className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                     />
                     <Input
                       placeholder="Quốc gia (country)"
                       value={Array.isArray(editData.address) ? ((editData.address[0] as any)?.country || "") : (typeof editData.address === 'object' ? (editData.address as any).country || "" : "")}
                       onChange={(e) => {
                         const base = Array.isArray(editData.address) ? (editData.address[0] as any) || {} : (typeof editData.address === 'object' ? (editData.address as any) : {});
                         const next = { ...base, country: e.target.value };
                         setEditData({ ...editData, address: [ next ] } as any);
                       }}
                       className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:border-yellow-400"
                     />
                   </div>
                 ) : (
                   <p className="text-blue-200 flex items-center">
                     <MapPin className="w-4 h-4 mr-2" />
                     {formatAddress(profileData.address)}
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
                <span className="text-white font-bold text-lg">{formatDate(profileData.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 mt-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-yellow-400" />
            Xác minh danh tính (KYC)
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(profileData as any).kycStatus === 'APPROVED' ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white font-medium">Đã xác minh</p>
                    <p className="text-green-300 text-sm">Tài khoản của bạn đã được xác minh</p>
                  </div>
                </>
              ) : (profileData as any).kycStatus === 'PENDING' ? (
                <>
                  <Shield className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Đang chờ xét duyệt</p>
                    <p className="text-yellow-300 text-sm">Yêu cầu xác minh đang được xem xét</p>
                  </div>
                </>
              ) : (
                <>
                  <Shield className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-white font-medium">Chưa xác minh</p>
                    <p className="text-blue-200 text-sm">Xác minh để tăng độ tin cậy</p>
                  </div>
                </>
              )}
            </div>
            
            <Button
              onClick={() => navigate('/kyc')}
              className="bg-[#ffc204] text-black hover:bg-[#ffc204]/90 border-[3px] border-[#214d8c]"
            >
              {(profileData as any).kycStatus === 'APPROVED' ? 'Xem chi tiết' : 'Xác minh ngay'}
            </Button>
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
