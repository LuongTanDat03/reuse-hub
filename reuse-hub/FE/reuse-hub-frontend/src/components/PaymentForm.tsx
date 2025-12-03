import React, { useState, useEffect } from 'react';
import { createPaymentIntent, CreatePaymentRequest } from '../api/payment';

interface PaymentFormProps {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
  linkedItemId?: string;
  linkedTransactionId?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  userId,
  amount,
  currency = 'vnd',
  description,
  linkedItemId,
  linkedTransactionId,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const request: CreatePaymentRequest = {
        amount,
        currency,
        description,
        linkedItemId,
        linkedTransactionId,
        paymentMethod: 'card',
      };

      const response = await createPaymentIntent(userId, request);

      if (response.status === 200 && response.data) {
        setClientSecret(response.data.clientSecret);
        setPaymentId(response.data.paymentId);
        onSuccess?.(response.data.paymentId);
      } else {
        const errorMsg = response.message || 'Không thể tạo thanh toán';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối đến server';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>
      
      <div className="mb-6 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Số tiền:</span>
          <span className="font-semibold">{formatCurrency(amount)}</span>
        </div>
        {description && (
          <div className="flex justify-between">
            <span className="text-gray-600">Mô tả:</span>
            <span className="text-sm">{description}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!clientSecret ? (
        <button
          onClick={handleCreatePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-semibold">Thanh toán đã được khởi tạo!</p>
            <p className="text-sm mt-1">Payment ID: {paymentId}</p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-gray-700">
              Client Secret đã được tạo. Tích hợp Stripe Elements để hoàn tất thanh toán.
            </p>
            <code className="block mt-2 p-2 bg-gray-100 text-xs break-all rounded">
              {clientSecret}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
