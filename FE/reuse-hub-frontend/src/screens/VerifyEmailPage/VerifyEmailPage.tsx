import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext will be updated
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // We will need to create/update useAuth to provide these
  const { verifyEmail, isLoading, error, clearError } = useAuth();

  const [verificationCode, setVerificationCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get user info from navigation state (from RegisterPage)
  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      // If no user info, redirect to register
      navigate('/register', { replace: true });
    }
  }, [userId, email, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    if (localError) setLocalError(null);
    if (error) clearError();
    if (successMessage) setSuccessMessage(null);
  };

  const validateCode = (): boolean => {
    if (!verificationCode.trim()) {
      setLocalError('Vui lòng nhập mã xác minh.');
      return false;
    }
    // Add more validation for code format if known
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCode()) return;

    if (!userId) {
      setLocalError('Không tìm thấy thông tin người dùng. Vui lòng đăng ký lại.');
      return;
    }

    try {
      // The verifyEmail function from AuthContext will call apiService.verifyEmail
      await verifyEmail(userId, verificationCode);
      
      setSuccessMessage('Xác minh email thành công! Bạn có thể đăng nhập ngay.');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email đã được xác minh. Vui lòng đăng nhập.',
            email: email,
          },
          replace: true 
        });
      }, 2000);

    } catch (err) {
      // Error is handled by AuthContext and will be displayed via the `error` state
      console.error('Email verification failed on page:', err);
      setSuccessMessage(null); // Clear success message if there was an error
    }
  };

  const handleResendCode = () => {
    // TODO: Implement API call to resend verification code
    // For now, just show a message
    setSuccessMessage('Mã xác minh mới đã được gửi đến email của bạn.');
  };

  if (!userId || !email) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Xác minh Email</CardTitle>
          <CardDescription className="text-center">
            Nhập mã xác minh đã được gửi đến địa chỉ: <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Mã xác minh</Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={handleInputChange}
                placeholder="Nhập mã của bạn"
                className="text-center text-lg"
              />
            </div>

            {successMessage && (
              <p className="text-sm text-green-600 text-center">{successMessage}</p>
            )}
            {(error || localError) && (
              <p className="text-sm text-red-600 text-center">{error || localError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang xác minh...' : 'Xác minh Email'}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Không nhận được mã?{' '}
              <Button variant="link" onClick={handleResendCode} className="p-0 h-auto">
                Gửi lại mã
              </Button>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <Button variant="link" onClick={() => navigate('/login')} className="p-0 h-auto">
                Trở về trang đăng nhập
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;


