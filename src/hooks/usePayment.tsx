
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
      
      console.log('Processing payment with method:', paymentMethod);
      console.log('Payment details:', details);
      
      // Handle PLYN Coins payment
      if (paymentMethod === 'plyn_coins') {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        console.log('Processing PLYN coins payment for user:', userId);
        
        // Get user's coin balance
        const userCoins = await getUserCoins(userId);
        const coinsRequired = amount * 2; // 2 coins per dollar
        
        console.log(`User has ${userCoins} coins, requires ${coinsRequired} coins`);
        
        if (userCoins < coinsRequired) {
          throw new Error(`Insufficient PLYN coins. You need ${coinsRequired} coins, but you have ${userCoins}.`);
        }
        
        // Deduct coins from user's balance
        const updatedCoins = userCoins - coinsRequired;
        const success = await updateUserCoins(userId, updatedCoins);
        
        if (!success) {
          throw new Error('Failed to update coin balance');
        }
        
        console.log(`Updated user coins from ${userCoins} to ${updatedCoins}`);
        
        // Create payment record - ensure we're using string transaction_id, not an object
        const transactionId = `coins_${Date.now()}`;
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            payment_method: 'plyn_coins',
            amount: amount,
            payment_status: 'completed',
            coins_used: coinsRequired,
            transaction_id: transactionId
          })
          .select()
          .single();
        
        if (paymentError) {
          console.error('Payment record creation error:', paymentError);
          throw new Error('Failed to record payment');
        }
        
        console.log('Created payment record:', payment.id);
        
        // Update booking with payment info if a booking was provided
        if (booking?.id) {
          console.log('Updating booking with payment info:', booking.id);
          const { error: bookingError } = await supabase
            .from('bookings')
            .update({
              payment_id: payment.id,
              payment_status: 'completed',
              status: 'confirmed'
            })
            .eq('id', booking.id);
            
          if (bookingError) {
            console.error('Booking update error:', bookingError);
            throw new Error('Failed to update booking status');
          }
        }
        
        // Navigate to confirmation page - ensure all values are primitive types, not objects
        navigate('/booking-confirmation', {
          state: {
            // Only include primitive values from booking, converting objects to primitives
            bookingId: booking?.id || '',
            salonName: booking?.salonName || '',
            services: booking?.services || [],
            date: booking?.date || '',
            timeSlot: booking?.timeSlot || '',
            totalPrice: booking?.totalPrice || 0,
            totalDuration: booking?.totalDuration || 0,
            paymentDetails: {
              paymentMethod: 'plyn_coins',
              paymentId: transactionId
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
