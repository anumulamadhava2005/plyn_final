
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserCoins, updateUserCoins } from '@/utils/userUtils';
import { PaymentDetails } from '@/types/admin';
import { 
  loadRazorpayScript, 
  openRazorpayCheckout, 
  verifyRazorpayPayment,
  createRazorpayOrder,
  updateBookingAfterPayment
} from '@/utils/razorpayUtils';

interface PaymentHookReturn {
  processPayment: (details: PaymentDetails) => Promise<void>;
  isProcessing: boolean;
  paymentError: string | null;
  handleRazorpayPayment: (orderId: string, paymentDetails: any) => Promise<void>;
}

export const usePayment = (): PaymentHookReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Ensure Razorpay script is loaded
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Handle Razorpay payment process
  const handleRazorpayPayment = async (orderId: string, paymentDetails: any) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Make sure Razorpay script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }
      
      // Open Razorpay checkout modal
      openRazorpayCheckout(
        orderId,
        paymentDetails.amount,
        {
          customerName: paymentDetails.booking?.customerName,
          email: paymentDetails.booking?.email,
          phone: paymentDetails.booking?.phone,
          currency: paymentDetails.currency || 'INR'
        },
        // Success handler
        async (response) => {
          console.log('Payment successful:', response);
          
          try {
            // Verify the payment with our backend
            const verifyResult = await verifyRazorpayPayment(
              orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            if (!verifyResult.success || !verifyResult.verified) {
              throw new Error('Payment verification failed');
            }
            
            // If there's a booking ID, update the booking status
            if (paymentDetails.booking?.id) {
              await updateBookingAfterPayment(
                paymentDetails.booking.id,
                orderId
              );
            }
            
            // Navigate to confirmation page
            navigate('/booking-confirmation', {
              state: {
                bookingId: paymentDetails.booking?.id || '',
                salonName: paymentDetails.booking?.salonName || '',
                services: paymentDetails.booking?.services || [],
                date: paymentDetails.booking?.date || '',
                timeSlot: paymentDetails.booking?.timeSlot || '',
                totalPrice: paymentDetails.amount || 0,
                totalDuration: paymentDetails.booking?.totalDuration || 0,
                paymentDetails: {
                  paymentMethod: 'razorpay',
                  paymentId: orderId,
                  razorpayPaymentId: response.razorpay_payment_id
                },
                paymentStatus: 'completed'
              }
            });
            
            toast({
              title: 'Payment Successful',
              description: 'Your payment was processed successfully.',
              variant: 'default',
            });
          } catch (error: any) {
            console.error('Error after payment:', error);
            setPaymentError(error.message || 'Error processing payment confirmation');
            toast({
              title: 'Payment Error',
              description: error.message || 'There was an error confirming your payment',
              variant: 'destructive',
            });
          } finally {
            setIsProcessing(false);
          }
        },
        // Error handler
        (error) => {
          console.error('Razorpay error:', error);
          setPaymentError(error.message || 'Payment processing failed');
          toast({
            title: 'Payment Failed',
            description: error.message || 'There was an error processing your payment',
            variant: 'destructive',
          });
          setIsProcessing(false);
        },
        // Modal close handler
        () => {
          setIsProcessing(false);
        }
      );
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      setPaymentError(error.message || 'Payment processing failed');
      toast({
        title: 'Payment Failed',
        description: error.message || 'There was an error processing your Razorpay payment',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };
  
  // Main payment processing function
  const processPayment = async (details: PaymentDetails) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      const { paymentMethod, amount, booking } = details;
      
      console.log('Processing payment with method:', paymentMethod);
      console.log('Payment details:', details);
      
      // Handle Razorpay payments
      if (paymentMethod === 'razorpay') {
        // Create a Razorpay order
        const paymentData = await createRazorpayOrder('razorpay', amount, booking);
        
        if (paymentData.success && paymentData.payment.orderId) {
          // Open Razorpay checkout
          await handleRazorpayPayment(paymentData.payment.orderId, {
            amount,
            booking
          });
        } else {
          throw new Error('Failed to create Razorpay order');
        }
        
        return;
      }
      
      // Handle PLYN Coins payments
      if (paymentMethod === 'plyn_coins') {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        console.log('Processing PLYN coins payment for user:', userId);
        
        // Get user's coin balance
        const userCoins = await getUserCoins(userId);
        const coinsRequired = amount * 2;
        
        console.log(`User has ${userCoins} coins, requires ${coinsRequired} coins`);
        
        if (userCoins < coinsRequired) {
          throw new Error(`Insufficient PLYN coins. You need ${coinsRequired} coins, but you have ${userCoins}.`);
        }
        
        // Update user's coin balance
        const updatedCoins = userCoins - coinsRequired;
        const success = await updateUserCoins(userId, updatedCoins);
        
        if (!success) {
          throw new Error('Failed to update coin balance');
        }
        
        console.log(`Updated user coins from ${userCoins} to ${updatedCoins}`);
        
        // Create payment record
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
        
        // Update booking if necessary
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
        
        // Navigate to confirmation
        navigate('/booking-confirmation', {
          state: {
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
        
        return;
      }
      
      // For any other payment methods
      throw new Error(`Payment method ${paymentMethod} is not supported yet`);
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
    paymentError,
    handleRazorpayPayment
  };
};
