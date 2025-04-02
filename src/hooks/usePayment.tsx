
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDetails {
  paymentMethod: string;
  amount: number;
  currency?: string;
  booking?: any;
}

interface PaymentHookReturn {
  processPayment: (details: PaymentDetails) => Promise<void>;
  verifyPayment: (paymentId: string, provider: string, sessionId?: string) => Promise<boolean>;
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
      const { data, error } = await supabase.functions.invoke('handle-payment', {
        body: details
      });
      
      if (error) {
        throw new Error(error.message || 'Payment processing failed');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Payment processing failed');
      }
      
      const { payment } = data;
      
      if (payment.status === 'completed') {
        // Payment is already completed (e.g., PLYN Coins)
        // Update booking with payment info and navigate to confirmation
        if (details.booking?.id) {
          await supabase
            .from('bookings')
            .update({ 
              payment_id: payment.dbId,
              payment_status: 'completed',
              status: 'confirmed'
            })
            .eq('id', details.booking.id);
        }
        
        navigate('/booking-confirmation', { 
          state: { 
            ...details.booking,
            paymentDetails: {
              paymentMethod: details.paymentMethod,
              paymentId: payment.paymentId
            },
            paymentStatus: 'completed'
          }
        });
      } else if (payment.url) {
        // For external payment methods that redirect to payment page
        if (["phonepe", "paytm", "netbanking", "upi", "qr_code"].includes(details.paymentMethod)) {
          // For simulated payment methods, navigate to our simulator
          navigate('/payment/simulator', { 
            search: `?method=${details.paymentMethod}&amount=${details.amount}&booking_id=${details.booking?.id || ''}`,
            state: { 
              paymentDetails: {
                ...details.booking,
                paymentId: payment.paymentId,
                provider: payment.provider,
                dbId: payment.dbId
              }
            }
          });
        } else {
          // For real payment gateways (like Stripe), redirect to their checkout
          window.location.href = payment.url;
        }
      } else {
        throw new Error('No payment URL provided');
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

  const verifyPayment = async (paymentId: string, provider: string, sessionId?: string): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { paymentId, provider, sessionId }
      });
      
      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }
      
      return data.verified;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentError(error.message || 'Payment verification failed');
      toast({
        title: 'Verification Failed',
        description: error.message || 'There was an error verifying your payment',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    verifyPayment,
    isProcessing,
    paymentError
  };
};
