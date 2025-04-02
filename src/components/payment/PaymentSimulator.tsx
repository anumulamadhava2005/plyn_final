
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const PaymentSimulator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [countdown, setCountdown] = useState(5);
  
  const method = searchParams.get('method') || 'unknown';
  const amount = searchParams.get('amount') || '0';
  const bookingId = searchParams.get('booking_id') || '';
  
  // Extract payment details from state if available
  const paymentDetails = location.state?.paymentDetails;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate successful payment 95% of the time
      const outcome = Math.random() > 0.05 ? 'success' : 'failed';
      setStatus(outcome);
      
      // Start countdown after payment is processed
      if (outcome === 'success') {
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              navigate('/booking-confirmation', { 
                state: { 
                  ...paymentDetails,
                  paymentStatus: 'completed',
                  bookingId: bookingId
                }
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(countdownInterval);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate, paymentDetails, bookingId]);
  
  const getMethodName = (method: string) => {
    const methodMap: Record<string, string> = {
      'phonepe': 'PhonePe',
      'paytm': 'Paytm',
      'netbanking': 'Net Banking',
      'upi': 'UPI',
      'qr_code': 'QR Code',
    };
    
    return methodMap[method] || method;
  };
  
  const handleTryAgain = () => {
    setStatus('processing');
    setCountdown(5);
    
    // Simulate payment processing again
    setTimeout(() => {
      setStatus('success');
      
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate('/booking-confirmation', { 
              state: { 
                ...paymentDetails,
                paymentStatus: 'completed',
                bookingId: bookingId
              }
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };
  
  const handleCancel = () => {
    navigate('/payment', { state: { canceled: true } });
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background/90">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">
            {status === 'processing' ? 'Processing Payment' : 
             status === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === 'processing' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-muted-foreground">
                Processing your payment of ${amount} via {getMethodName(method)}...
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center mb-2">
                Payment of ${amount} completed successfully!
              </p>
              <p className="text-center text-muted-foreground">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-center text-muted-foreground">
                We couldn't process your payment. Please try again.
              </p>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-2">
          {status === 'failed' && (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleTryAgain}>Try Again</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSimulator;
