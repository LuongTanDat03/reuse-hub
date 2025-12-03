import { useState } from 'react';
import { createPaymentIntent, getPaymentById, getPaymentByTransactionId, CreatePaymentRequest, PaymentResponse } from '../api/payment';

export const usePayment = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (request: CreatePaymentRequest): Promise<PaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await createPaymentIntent(userId, request);
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Không thể tạo thanh toán');
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối đến server';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPayment = async (paymentId: string): Promise<PaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPaymentById(userId, paymentId);
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Không tìm thấy thanh toán');
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối đến server';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentByTransaction = async (transactionId: string): Promise<PaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getPaymentByTransactionId(userId, transactionId);
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Không tìm thấy thanh toán');
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Lỗi kết nối đến server';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPayment,
    getPayment,
    getPaymentByTransaction,
  };
};
