
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking, bookSlot } from '@/utils/bookingUtils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PaymentForm, { PaymentFormValues } from '@/components/payment/PaymentForm';
import PageTransition from '@/components/transitions/PageTransition';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getUserCoins, updateUserCoins } from '@/utils/userUtils';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [userCoins, setUserCoins] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plyCoinsEnabled, setPlyCoinsEnabled] = useState(true);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  
  const { 
    salonId, 
    salonName, 
    services, 
    date, 
    timeSlot, 
    email, 
    phone, 
    notes, 
    totalPrice, 
    totalDuration,
    slotId,
    workerId
  } = location.state || {};
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('canceled') === 'true' || location.state?.canceled) {
      setPaymentCanceled(true);
    }
    
    if (!salonId || !services || !date || !timeSlot || !totalPrice) {
      toast({
        title: "Invalid Booking Details",
        description: "Missing booking details. Please book again.",
        variant: "destructive",
      });
      navigate('/book-now');
      return;
    }
    
    const fetchUserData = async () => {
      if (user) {
        const coins = await getUserCoins(user.id);
        setUserCoins(coins);
      }
    };
    
    fetchUserData();
  }, [user, navigate, toast, salonId, services, date, timeSlot, totalPrice, location]);
  
  const handlePayment = async (values: PaymentFormValues) => {
    try {
      setIsProcessing(true);
      let slotToUse = slotId;
      let workerIdToUse = workerId;
      
      if (slotToUse) {
        const { data: slotExists, error: slotError } = await supabase
          .from('slots')
          .select('is_booked, worker_id')
          .eq('id', slotToUse)
          .single();
        
        if (slotError) {
          toast({
            title: "Slot not found",
            description: "The selected time slot is no longer available. Please select another time.",
            variant: "destructive",
          });
          navigate(`/book/${salonId}`);
          return;
        }
        
        if (slotExists.is_booked) {
          toast({
            title: "Slot already booked",
            description: "Sorry, this time slot has just been booked. Please select another time.",
            variant: "destructive",
          });
          navigate(`/book/${salonId}`);
          return;
        }
        
        if (slotExists.worker_id) {
          workerIdToUse = slotExists.worker_id;
        }
      }

      // Book the slot
      await bookSlot(slotToUse);

      // Process PLYN Coins payment if that's the selected method
      if (values.paymentMethod === 'plyn_coins') {
        const coinsRequired = totalPrice * 2; // 2 coins per dollar
        
        if (userCoins < coinsRequired) {
          toast({
            title: "Insufficient PLYN Coins",
            description: `You need ${coinsRequired} coins, but you only have ${userCoins}.`,
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        // Deduct coins from user's balance
        const updatedCoins = userCoins - coinsRequired;
        const updateSuccess = await updateUserCoins(user!.id, updatedCoins);
        
        if (!updateSuccess) {
          toast({
            title: "Payment Failed",
            description: "Failed to process PLYN Coins payment.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }
        
        setUserCoins(updatedCoins);
      }
          
      // Create booking record
      const bookingData = {
        user_id: user?.id,
        merchant_id: salonId,
        salon_name: salonName,
        service_name: services.map((s: any) => s.name).join(', '),
        service_price: totalPrice,
        service_duration: totalDuration,
        booking_date: date,
        time_slot: timeSlot,
        customer_email: values.email,
        customer_phone: values.phone,
        additional_notes: values.notes,
        status: 'pending',
        slot_id: slotToUse,
        worker_id: workerIdToUse || null,
        coins_earned: 0,
        coins_used: values.paymentMethod === 'plyn_coins' ? totalPrice * 2 : 0
      };
      
      const bookingId = await createBooking(bookingData);
      
      // Create payment record directly in database
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          payment_method: values.paymentMethod,
          amount: totalPrice,
          payment_status: 'completed',
          coins_used: values.paymentMethod === 'plyn_coins' ? totalPrice * 2 : 0,
          transaction_id: `payment_${Date.now()}`
        })
        .select('id')
        .single();
      
      if (paymentError) {
        throw new Error("Failed to record payment");
      }
      
      // Update booking with payment information
      await supabase
        .from('bookings')
        .update({ 
          payment_id: paymentRecord.id,
          payment_status: 'completed',
          status: 'confirmed'
        })
        .eq('id', bookingId);
      
      // Navigate to confirmation page
      navigate('/booking-confirmation', { 
        state: { 
          id: bookingId,
          bookingId: bookingId,
          salonName,
          services,
          date,
          timeSlot,
          totalPrice,
          totalDuration,
          coinsUsed: values.paymentMethod === 'plyn_coins' ? totalPrice * 2 : 0,
          coinsEarned: 0,
          paymentDetails: {
            paymentMethod: values.paymentMethod,
            paymentId: paymentRecord.id
          },
          paymentStatus: 'completed'
        }
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!salonId || !services || !date || !timeSlot || !totalPrice) {
    return null;
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto py-12">
        <Card className="shadow-md rounded-md">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Payment</h1>
              <p className="text-muted-foreground">
                Confirm your booking details and complete your payment.
              </p>
            </div>
            
            {paymentCanceled && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Canceled</AlertTitle>
                <AlertDescription>
                  Your previous payment attempt was canceled. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Booking Summary</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Salon:</Badge>
                  <span>{salonName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Services:</Badge>
                  <span>{services.map((s: any) => s.name).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Date:</Badge>
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Time:</Badge>
                  <span>{timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Total:</Badge>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
            
            <PaymentForm
              defaultValues={{
                email: email || '',
                phone: phone || '',
                notes: notes || '',
              }}
              onSubmit={handlePayment}
              isSubmitting={isProcessing}
              totalPrice={totalPrice}
              userCoins={userCoins}
              plyCoinsEnabled={plyCoinsEnabled}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Payment;
