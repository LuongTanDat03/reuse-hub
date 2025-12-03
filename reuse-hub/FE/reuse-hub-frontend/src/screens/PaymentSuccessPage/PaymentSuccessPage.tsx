import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { syncPaymentStatus } from '../../api/payment';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const paymentIntent = searchParams.get('payment_intent');
  const paymentId = searchParams.get('paymentId');
  const userId = searchParams.get('userId');
  const redirectStatus = searchParams.get('redirect_status');

  // Sync payment status when page loads (if payment was successful)
  useEffect(() => {
    let isCancelled = false;
    
    const syncStatus = async () => {
      if (redirectStatus === 'succeeded' && paymentId && userId) {
        // Check if already synced in this session
        const syncKey = `payment_synced_${paymentId}`;
        if (sessionStorage.getItem(syncKey)) {
          console.log('Payment already synced in this session, skipping...');
          return;
        }
        
        setSyncing(true);
        try {
          await syncPaymentStatus(userId, paymentId);
          if (!isCancelled) {
            console.log('Payment status synced successfully');
            // Mark as synced in session storage
            sessionStorage.setItem(syncKey, 'true');
          }
        } catch (error) {
          if (!isCancelled) {
            console.error('Failed to sync payment status:', error);
            setSyncError('Không thể đồng bộ trạng thái thanh toán');
          }
        } finally {
          if (!isCancelled) {
            setSyncing(false);
          }
        }
      }
    };
    
    syncStatus();
    
    return () => {
      isCancelled = true;
    };
  }, [redirectStatus, paymentId, userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/transactions');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const isSuccess = redirectStatus === 'succeeded';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
        {isSuccess ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 text-center mb-6">
              {syncing ? 'Đang đồng bộ trạng thái...' : 'Giao dịch của bạn đã được xử lý thành công.'}
            </p>
            {syncError && (
              <p className="text-yellow-600 text-center text-sm mb-4">{syncError}</p>
            )}

            {paymentIntent && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Mã thanh toán:</p>
                <p className="text-sm font-mono break-all">{paymentIntent}</p>
              </div>
            )}

            <p className="text-center text-sm text-gray-500 mb-4">
              Tự động chuyển hướng sau {countdown} giây...
            </p>

            <button
              onClick={() => navigate('/transactions')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Xem giao dịch
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 text-center mb-6">
              Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
            </p>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Quay về trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
};
