
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserCoins, updateUserCoins } from '@/utils/userUtils';

interface PaymentDetails {
  paymentMethod: string;
  amount: number;
  currency?: string;
  booking?: any;
}

interface PaymentHookReturn {
  processPayment: (details: PaymentDetails) => Promise<void>;
  isProcessing: boolean;
  paymentError: string | null;
}

export const usePayment = (): PaymentHookReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const processPayment = async (details: PaymentDetails) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      const { paymentMethod, amount, booking } = details;
      
      // Handle PLYN Coins payment
      if (paymentMethod === 'plyn_coins') {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        
        // Get user's coin balance
        const userCoins = await getUserCoins(userId);
        const coinsRequired = amount * 2; // 2 coins per dollar
        
        if (userCoins < coinsRequired) {
          throw new Error(`Insufficient PLYN coins. You need ${coinsRequired} coins, but you have ${userCoins}.`);
        }
        
        // Deduct coins from user's balance
        const updatedCoins = userCoins - coinsRequired;
        const success = await updateUserCoins(userId, updatedCoins);
        
        if (!success) {
          throw new Error('Failed to update coin balance');
        }
        
        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            payment_method: 'plyn_coins',
            amount: amount,
            payment_status: 'completed',
            coins_used: coinsRequired,
            transaction_id: `coins_${Date.now()}`
          })
          .select()
          .single();
        
        if (paymentError) {
          throw new Error('Failed to record payment');
        }
        
        // Update booking with payment info if a booking was provided
        if (booking?.id) {
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_id: payment.id,
              payment_status: 'completed',
              status: 'confirmed'
            })
            .eq('id', booking.id);
            
          if (bookingError) {
            throw new Error('Failed to update booking status');
          }
        }
        
        // Navigate to confirmation page
        navigate('/booking-confirmation', {
          state: {
            ...booking,
            paymentDetails: {
              paymentMethod: 'plyn_coins',
              paymentId: payment.transaction_id
            },
            paymentStatus: 'completed',
            coinsUsed: coinsRequired
          }
        });
      } else {
        // For non-PLYN coins payments, we would normally handle them here
        // Since we're focusing only on PLYN coins, throw an error for other payment methods
        throw new Error('Only PLYN Coins payment is currently supported');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setPaymentError(error.message || 'Payment processing failed');
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was an error processing your payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing,
    paymentError
  };
};
