import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, CreatePaymentRequest } from '../api/payment';

// Thay YOUR_STRIPE_PUBLISHABLE_KEY bằng key thực tế từ Stripe Dashboard
// @ts-ignore - Vite env types
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  paymentId: string;
  userId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ paymentId, userId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    // Include paymentId and userId in return_url for status sync
    const returnUrl = `${window.location.origin}/payment-success?paymentId=${paymentId}&userId=${userId}`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      setMessage(error.message || 'Có lỗi xảy ra khi thanh toán');
      onError?.(error.message || 'Payment failed');
    } else {
      onSuccess?.();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {message && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán'}
      </button>
    </form>
  );
};

interface StripePaymentFormProps {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
  linkedItemId?: string;
  linkedTransactionId?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  userId,
  amount,
  currency = 'vnd',
  description,
  linkedItemId,
  linkedTransactionId,
  onSuccess,
  onError,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent duplicate API calls (survives re-renders)
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const initializePayment = async () => {
      // Check if already initialized or currently initializing
      if (hasInitializedRef.current || isInitializingRef.current) {
        console.log('Payment already initialized or initializing, skipping...');
        return;
      }
      
      // Additional check: if we have a transactionId, check if payment was recently created
      if (linkedTransactionId) {
        const recentPaymentKey = `payment_init_${linkedTransactionId}`;
        const recentPayment = sessionStorage.getItem(recentPaymentKey);
        
        if (recentPayment) {
          const paymentData = JSON.parse(recentPayment);
          const timeDiff = Date.now() - paymentData.timestamp;
          
          // If payment was created less than 5 minutes ago, skip
          if (timeDiff < 5 * 60 * 1000) {
            console.log('Payment recently created for this transaction, skipping...');
            setError('Giao dịch này đã có thanh toán. Vui lòng kiểm tra lại trang giao dịch.');
            setLoading(false);
            return;
          }
        }
      }
      
      // Mark as initializing
      isInitializingRef.current = true;
      hasInitializedRef.current = true;
      
      try {
        const request: CreatePaymentRequest = {
          amount,
          currency,
          description,
          linkedItemId,
          linkedTransactionId,
          paymentMethod: 'card',
        };

        console.log('Creating payment intent...', request);
        const response = await createPaymentIntent(userId, request);

        // Don't check isCancelled here - let the response process
        // The guards (hasInitializedRef) prevent duplicate calls anyway
        console.log('Payment API response:', response);

        if (response.status === 200 && response.data) {
          const paymentData = response.data;
          console.log('Payment data:', paymentData);
          
          setClientSecret(paymentData.clientSecret);
          setPaymentId(paymentData.paymentId);
          console.log('Payment intent created:', paymentData.paymentId, 'clientSecret:', paymentData.clientSecret);
          
          // Store in sessionStorage to prevent duplicate creation
          if (linkedTransactionId) {
            const recentPaymentKey = `payment_init_${linkedTransactionId}`;
            sessionStorage.setItem(recentPaymentKey, JSON.stringify({
              paymentId: response.data.paymentId,
              timestamp: Date.now()
            }));
          }
        } else {
          const errorMsg = response.message || 'Không thể tạo thanh toán';
          setError(errorMsg);
          onError?.(errorMsg);
        }
      } catch (err: any) {
        let errorMsg = err.response?.data?.message || err.message || 'Lỗi kết nối đến server';
        
        // Handle duplicate payment error
        if (errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
          errorMsg = 'Giao dịch này đã có thanh toán. Vui lòng kiểm tra lại trang giao dịch.';
        }
        
        console.error('Payment initialization error:', errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
        isInitializingRef.current = false;
      }
    };

    initializePayment();
  }, []); // Empty array - only run once on mount

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  console.log('StripePaymentForm render - loading:', loading, 'error:', error, 'clientSecret:', clientSecret);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Đang khởi tạo thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
        <button
          onClick={() => window.location.href = '/transactions'}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Quay lại trang giao dịch
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    console.log('No clientSecret, returning null');
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Không thể khởi tạo thanh toán. Vui lòng thử lại.
        </div>
      </div>
    );
  }

  console.log('Rendering payment form with clientSecret');

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
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

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          paymentId={paymentId!}
          userId={userId}
          onSuccess={() => onSuccess?.(paymentId!)}
          onError={onError}
        />
      </Elements>
    </div>
  );
};
