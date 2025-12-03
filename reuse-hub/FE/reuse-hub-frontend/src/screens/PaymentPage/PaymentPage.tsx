import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StripePaymentForm } from '../../components/StripePaymentForm';
import { useAuth } from '../../contexts/AuthContext';

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const paymentParams = useMemo(() => {
    const userIdFromUrl = searchParams.get('userId') || '';
    const userId = userIdFromUrl || user?.id || localStorage.getItem('userId') || '';
    const amount = Number(searchParams.get('amount')) || 0;
    const transactionId = searchParams.get('transactionId') || undefined;
    const itemId = searchParams.get('itemId') || undefined;
    const description = searchParams.get('description') || 'Thanh toán giao dịch';
    
    return { userId, amount, transactionId, itemId, description };
  }, [searchParams, user?.id]);

  console.log('PaymentPage - userId:', paymentParams.userId, 'amount:', paymentParams.amount, 'isAuthenticated:', isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
    if (paymentParams.amount <= 0 && !paymentParams.transactionId) {
      console.log('Invalid amount and no transactionId, redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, paymentParams.amount, paymentParams.transactionId, navigate]);

  const handlePaymentSuccess = useCallback((paymentId: string) => {
    console.log('Payment successful:', paymentId);
    navigate('/transactions');
  }, [navigate]);

  const handlePaymentError = useCallback((error: string) => {
    console.error('Payment error:', error);
  }, []);

  if (!isAuthenticated || (paymentParams.amount <= 0 && !paymentParams.transactionId)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <StripePaymentForm
          key={paymentParams.transactionId} 
          userId={paymentParams.userId}
          amount={paymentParams.amount}
          currency="vnd"
          description={paymentParams.description}
          linkedTransactionId={paymentParams.transactionId}
          linkedItemId={paymentParams.itemId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </div>
  );
};
