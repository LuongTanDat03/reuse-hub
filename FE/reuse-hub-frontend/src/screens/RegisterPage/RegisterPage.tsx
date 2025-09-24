import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext will be updated
import { UserCreationRequest } from '../../types/api';
import { GENDER } from '../../types/constants';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  // We will need to create/update useAuth to provide these
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<UserCreationRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    gender: GENDER.MALE,
    username: '',
    password: '',
    address: [{
      addressLine: '',
      ward: '',
      district: '',
      city: '',
      country: 'Vietnam'
    }]
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError(null);
    if (error) clearError();
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.split('.')[1];
    setFormData(prev => ({
      ...prev,
      address: [{ ...prev.address[0], [field]: value }]
    }));
  };

  const validateForm = (): boolean => {
    if (formData.password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp.');
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    // Add more validation as needed (e.g., regex for email/phone)
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // The register function from AuthContext will call apiService.register
      const response = await register(formData);
      
      // On success, navigate to the verification page
      navigate('/verify-email', {
        state: {
          userId: response.id, // The ID from the successful registration response
          email: response.email,
        },
      });
    } catch (err) {
      // Error is handled by AuthContext and will be displayed via the `error` state
      console.error('Registration failed on page:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
          <CardDescription className="text-center">
            Điền thông tin dưới đây để bắt đầu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Họ</Label>
                <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Ngày sinh</Label>
                <Input id="birthday" name="birthday" type="date" required value={formData.birthday} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded">
                  <option value={GENDER.MALE}>Nam</option>
                  <option value={GENDER.FEMALE}>Nữ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input id="username" name="username" required value={formData.username} onChange={handleInputChange} />
              </div>
            </div>
            
            <hr />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            
            <hr />
            
            <div className="space-y-4">
              <h3 className="font-semibold">Địa chỉ</h3>
               <div className="space-y-2">
                <Label htmlFor="address.addressLine">Địa chỉ chi tiết</Label>
                <Input id="address.addressLine" name="address.addressLine" value={formData.address[0].addressLine} onChange={handleAddressChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="address.ward">Phường/Xã</Label>
                  <Input id="address.ward" name="address.ward" value={formData.address[0].ward} onChange={handleAddressChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="address.district">Quận/Huyện</Label>
                  <Input id="address.district" name="address.district" value={formData.address[0].district} onChange={handleAddressChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="address.city">Tỉnh/Thành phố</Label>
                  <Input id="address.city" name="address.city" value={formData.address[0].city} onChange={handleAddressChange} />
                </div>
              </div>
            </div>

            {(error || localError) && (
              <p className="text-sm text-red-600 text-center">{error || localError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Đã có tài khoản?{' '}
            <Button variant="link" onClick={() => navigate('/login')} className="p-0 h-auto">
              Đăng nhập ngay
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;


