import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserCoins, updateUserCoins } from '@/utils/userUtils';
import { PaymentDetails } from '@/types/admin';

interface PaymentHookReturn {
  processPayment: (details: PaymentDetails) => Promise<void>;
  isProcessing: boolean;
  paymentError: string | null;
  handleRazorpayPayment: (orderId: string, paymentDetails: any) => Promise<void>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const usePayment = (): PaymentHookReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        return;
      }
      
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          resolve(true);
        };
        document.body.appendChild(script);
      });
    };
    
    loadRazorpayScript();
  }, []);

  const handleRazorpayPayment = async (orderId: string, paymentDetails: any) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load');
      }
      
      const options = {
        key: 'rzp_test_CABuOHaSHHGey2',
        amount: paymentDetails.amount * 100,
        currency: paymentDetails.currency || 'INR',
        name: 'Salon Booking',
        description: 'Payment for salon services',
        order_id: orderId,
        handler: async function(response: any) {
          console.log('Payment successful:', response);
          
          const { data: userData } = await supabase.auth.getUser();
          if (!userData?.user) {
            throw new Error('User not authenticated');
          }
          
          const verifyResponse = await fetch('https://nwisboqodsjdbnsiywax.supabase.co/functions/v1/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              paymentId: orderId,
              provider: 'razorpay',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
          });
          
          const verifyResult = await verifyResponse.json();
          if (!verifyResult.success || !verifyResult.verified) {
            throw new Error('Payment verification failed');
          }
          
          if (paymentDetails.booking?.id) {
            console.log('Updating booking with payment info:', paymentDetails.booking.id);
            const { error: bookingError } = await supabase
              .from('bookings')
              .update({
                payment_id: orderId,
                payment_status: 'completed',
                status: 'confirmed'
              })
              .eq('id', paymentDetails.booking.id);
              
            if (bookingError) {
              console.error('Booking update error:', bookingError);
              throw new Error('Failed to update booking status');
            }
          }
          
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
        },
        prefill: {
          name: paymentDetails.booking?.customerName || '',
          email: paymentDetails.booking?.email || '',
          contact: paymentDetails.booking?.phone || ''
        },
        theme: {
          color: '#3498db'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
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
  
  const processPayment = async (details: PaymentDetails) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      const { paymentMethod, amount, booking } = details;
      
      console.log('Processing payment with method:', paymentMethod);
      console.log('Payment details:', details);
      
      if (paymentMethod === 'razorpay') {
        const response = await fetch('https://nwisboqodsjdbnsiywax.supabase.co/functions/v1/handle-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            paymentMethod: 'razorpay',
            amount,
            booking
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to initialize Razorpay payment');
        }
        
        const paymentData = await response.json();
        if (paymentData.success && paymentData.payment.orderId) {
          await handleRazorpayPayment(paymentData.payment.orderId, {
            amount,
            booking
          });
        } else {
          throw new Error('Failed to create Razorpay order');
        }
        
        return;
      }
      
      if (paymentMethod === 'plyn_coins') {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        console.log('Processing PLYN coins payment for user:', userId);
        
        const userCoins = await getUserCoins(userId);
        const coinsRequired = amount * 2;
        
        console.log(`User has ${userCoins} coins, requires ${coinsRequired} coins`);
        
        if (userCoins < coinsRequired) {
          throw new Error(`Insufficient PLYN coins. You need ${coinsRequired} coins, but you have ${userCoins}.`);
        }
        
        const updatedCoins = userCoins - coinsRequired;
        const success = await updateUserCoins(userId, updatedCoins);
        
        if (!success) {
          throw new Error('Failed to update coin balance');
        }
        
        console.log(`Updated user coins from ${userCoins} to ${updatedCoins}`);
        
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
      } else {
        throw new Error(`Payment method ${paymentMethod} is not fully implemented yet`);
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
    paymentError,
    handleRazorpayPayment
  };
};
