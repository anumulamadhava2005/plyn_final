
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkSlotAvailability, createBooking, bookSlot } from '@/utils/bookingUtils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PaymentForm, { PaymentFormValues } from '@/components/payment/PaymentForm';
import { usePayment } from '@/hooks/usePayment';
import PageTransition from '@/components/transitions/PageTransition';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { processPayment, isProcessing } = usePayment();
  const [userCoins, setUserCoins] = useState(0);
  const [plyCoinsEnabled, setPlyCoinsEnabled] = useState(false);
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
    slotId
  } = location.state || {};
  
  useEffect(() => {
    // Check if payment was canceled (returned from payment page)
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
    
    // Fetch user coins and ply coins settings
    const fetchUserData = async () => {
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('coins')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        } else {
          setUserCoins(profileData?.coins || 0);
        }
      }
      
      // Check merchant_settings table for ply_coins_enabled
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('merchant_settings')
          .select('*')
          .eq('merchant_id', salonId)
          .limit(1);
          
        if (!settingsError && settingsData && settingsData.length > 0) {
          // Default to true for now as the schema doesn't have ply_coins_enabled yet
          setPlyCoinsEnabled(true);
        } else {
          console.log("No merchant settings found, defaulting to enabled");
          // Default to enabled if we can't check
          setPlyCoinsEnabled(true);
        }
      } catch (error) {
        console.error("Error checking settings:", error);
        // Default to enabled if we can't check
        setPlyCoinsEnabled(true);
      }
    };
    
    fetchUserData();
  }, [user, navigate, toast, salonId, services, date, timeSlot, totalPrice, location]);
  
  const handleSubmit = async (values: PaymentFormValues) => {
    try {
      // Verify slot is still available
      const { available } = await checkSlotAvailability(salonId, date, timeSlot);
      
      if (!available) {
        toast({
          title: "Slot no longer available",
          description: "Sorry, this time slot has just been booked. Please select another time.",
          variant: "destructive",
        });
        navigate(`/book/${salonId}`);
        return;
      }
      
      // Book the slot first to mark it as unavailable
      await bookSlot(slotId);
      
      // Assign a worker to the booking
      let workerId: string | undefined;
      
      try {
        const { data: availableWorkers, error: workersError } = await supabase
          .from('workers')
          .select('id')
          .eq('merchant_id', salonId)
          .eq('is_active', true)
          .limit(1);
        
        if (!workersError && availableWorkers && availableWorkers.length > 0) {
          workerId = availableWorkers[0].id;
        }
      } catch (error) {
        console.error("Error finding available worker:", error);
      }
      
      // Create booking record first
      const bookingData = {
        user_id: user?.id,
        user_profile_id: user?.id,
        merchant_id: salonId,
        salon_id: salonId,
        salon_name: salonName,
        service_name: services.map((s: any) => s.name).join(', '),
        service_price: totalPrice,
        service_duration: totalDuration,
        booking_date: date,
        time_slot: timeSlot,
        customer_email: values.email,
        customer_phone: values.phone,
        additional_notes: values.notes,
        status: 'pending', // Will be updated to confirmed after payment
        slot_id: slotId,
        worker_id: workerId,
        coins_earned: 0,
        coins_used: values.paymentMethod === 'plyn_coins' ? totalPrice * 2 : 0,
      };
      
      const { id: bookingId } = await createBooking(bookingData);
      
      // Now process the payment
      await processPayment({
        paymentMethod: values.paymentMethod,
        amount: totalPrice,
        booking: {
          id: bookingId,
          salonName,
          services,
          date,
          timeSlot,
          totalPrice,
          totalDuration,
          coinsUsed: values.paymentMethod === 'plyn_coins' ? totalPrice * 2 : 0
        }
      });
      
      // Navigation is handled inside processPayment
      
    } catch (error: any) {
      console.error("Error during payment:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment. Please try again.",
        variant: "destructive",
      });
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
              onSubmit={handleSubmit}
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
