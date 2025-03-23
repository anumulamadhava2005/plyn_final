
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { 
  createBooking, 
  createPayment, 
  checkSlotAvailability, 
  bookSlot
} from '@/utils/bookingUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showBookingSuccessNotification } from '@/components/booking/BookingSuccessNotification';
import BookingSummary from '@/components/payment/BookingSummary';
import PaymentForm, { PaymentFormValues } from '@/components/payment/PaymentForm';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { getBookingData, saveBookingData, clearBookingData } from '@/utils/bookingStorageUtils';
import { BookingFormData } from '@/types/merchant';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("Payment page - Initializing");
    console.log("Payment page - Location state:", location.state);
    
    // First try to get data from location state
    if (location.state && location.state.salonId && location.state.services) {
      console.log("Using booking data from location state");
      setBookingData(location.state);
      
      // Also store in session storage as backup
      try {
        saveBookingData(location.state);
      } catch (error) {
        console.error("Error storing booking data in session storage:", error);
      }
      
      setIsLoading(false);
      return;
    }
    
    // If not in location state, try session storage
    console.log("Attempting to retrieve booking data from session storage");
    const storedData = getBookingData();
    
    if (storedData) {
      console.log("Retrieved valid booking data from session storage:", storedData);
      setBookingData(storedData);
      setIsLoading(false);
      return;
    }
    
    // If we get here, no valid booking data was found
    console.error("No valid booking data found in location state or session storage");
    toast({
      title: "Missing booking information",
      description: "Please select a salon and services before proceeding to payment.",
      variant: "destructive",
    });
    
    // Allow a slight delay before navigation to ensure the toast is shown
    setTimeout(() => {
      navigate('/book-now');
    }, 500);
    
  }, [location.state, navigate, toast]);
  
  const defaultValues = {
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    phone: userProfile?.phoneNumber || userProfile?.phone_number || "",
    email: user?.email || "",
    paymentMethod: "credit_card",
    notes: "",
  };
  
  const handlePayment = async (values: PaymentFormValues) => {
    try {
      setIsSubmitting(true);
      setPaymentError(null);
      
      console.log("Processing payment with values:", values);
      
      if (!user) {
        console.error("User is not authenticated");
        toast({
          title: "Authentication Required",
          description: "Please sign in to book an appointment.",
          variant: "destructive",
        });
        navigate('/auth', { state: { redirectTo: `/payment` } });
        return;
      }
      
      if (!bookingData || !bookingData.salonId || !bookingData.timeSlot) {
        console.error("Invalid booking data:", bookingData);
        setPaymentError("Invalid booking data. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Convert date to ISO string format for API calls
      const bookingDate = bookingData.date instanceof Date 
        ? bookingData.date.toISOString().split('T')[0]
        : new Date(bookingData.date).toISOString().split('T')[0];
        
      console.log("Checking slot availability for:", {
        salonId: bookingData.salonId,
        date: bookingDate,
        timeSlot: bookingData.timeSlot
      });
      
      // Check if the slot is available
      const slotCheck = await checkSlotAvailability(
        bookingData.salonId,
        bookingDate,
        bookingData.timeSlot
      );
      
      console.log("Slot availability check result:", slotCheck);
      
      if (!slotCheck.available) {
        console.error("Slot is not available");
        setPaymentError("Sorry, this time slot is no longer available. Please select another time.");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Slot is available, proceeding with booking creation. Slot ID:", slotCheck.slotId);
      
      // Create the booking
      const newBooking = await createBooking({
        userId: user.id,
        salonId: bookingData.salonId,
        salonName: bookingData.salonName,
        serviceName: bookingData.services.map((s) => s.name).join(", "),
        date: bookingDate,
        timeSlot: bookingData.timeSlot,
        email: values.email,
        phone: values.phone,
        totalPrice: bookingData.totalPrice,
        totalDuration: bookingData.totalDuration,
        slotId: slotCheck.slotId,
        notes: values.notes
      });
      
      console.log("Booking created:", newBooking);
      
      // Create the payment
      const payment = await createPayment({
        bookingId: newBooking.id,
        userId: user.id,
        amount: bookingData.totalPrice,
        paymentMethod: values.paymentMethod,
        paymentStatus: "completed",
        transactionId: `AUTO-${Math.floor(Math.random() * 1000000)}`
      });
      
      console.log("Payment created:", payment);
      
      // Book the slot
      await bookSlot(slotCheck.slotId);
      console.log("Slot booked successfully");
      
      // Show success toast
      toast({
        title: "Booking Successful!",
        description: "Your appointment has been confirmed.",
      });
      
      // Show booking success notification
      showBookingSuccessNotification({
        ...bookingData,
        date: new Date(bookingData.date),
        timeSlot: bookingData.timeSlot
      });
      
      // Clear the session storage after successful booking
      clearBookingData();
      
      // Navigate to booking confirmation page
      navigate('/booking-confirmation', { 
        state: {
          ...bookingData,
          bookingId: newBooking.id,
          paymentDetails: {
            cardName: values.cardName || "N/A",
            cardNumber: values.cardNumber ? values.cardNumber.slice(-4).padStart(16, '*') : "****",
            expiryDate: values.expiryDate || "N/A",
            paymentMethod: values.paymentMethod || "auto"
          }
        }
      });
    } catch (error) {
      console.error("Booking error:", error);
      setPaymentError("There was an error processing your booking. Please try again.");
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading booking details...</p>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }
  
  if (!bookingData) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-20">
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold mb-4">No Booking Information</h1>
              <p className="mb-6">Please select a salon and services before proceeding to payment.</p>
              <AnimatedButton onClick={() => navigate('/book-now')}>
                Browse Salons
              </AnimatedButton>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-5xl">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl font-bold mb-8 text-center"
              >
                Complete Your Booking
              </motion.h1>
              
              {paymentError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookingSummary 
                    salonName={bookingData.salonName}
                    services={bookingData.services}
                    date={bookingData.date}
                    timeSlot={bookingData.timeSlot}
                    totalDuration={bookingData.totalDuration}
                    totalPrice={bookingData.totalPrice}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="glass-card p-6 rounded-lg">
                    <PaymentForm 
                      defaultValues={defaultValues}
                      onSubmit={handlePayment}
                      isSubmitting={isSubmitting}
                      totalPrice={bookingData.totalPrice}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Payment;
