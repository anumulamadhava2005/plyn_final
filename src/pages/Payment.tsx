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
  bookSlot, 
  initializeDatabase 
} from '@/utils/bookingUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { showBookingSuccessNotification } from '@/components/booking/BookingSuccessNotification';
import BookingSummary from '@/components/payment/BookingSummary';
import PaymentForm, { PaymentFormValues } from '@/components/payment/PaymentForm';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initDb = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const result = await initializeDatabase();
          console.log('Database initialization result:', result);
        } catch (error) {
          console.error('Failed to initialize database:', error);
        }
      }
    };
    
    initDb();
  }, []);
  
  useEffect(() => {
    console.log("Location state:", location.state);
    if (location.state) {
      setBookingData(location.state);
    } else {
      console.log("No booking data found in location state");
      navigate('/book-now');
    }
    setIsLoading(false);
  }, [location.state, navigate]);
  
  const defaultValues = {
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    phone: userProfile?.phoneNumber || "",
    email: user?.email || "",
    paymentMethod: "credit_card",
    notes: "",
  };
  
  const handlePayment = async (values: PaymentFormValues) => {
    try {
      setIsSubmitting(true);
      setPaymentError(null);
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to book an appointment.",
          variant: "destructive",
        });
        navigate('/auth', { state: { redirectTo: `/payment` } });
        return;
      }
      
      const slotCheck = await checkSlotAvailability(
        bookingData.salonId,
        new Date(bookingData.date).toISOString().split('T')[0],
        bookingData.timeSlot
      );
      
      if (!slotCheck.available) {
        setPaymentError("Sorry, this time slot is no longer available. Please select another time.");
        setIsSubmitting(false);
        return;
      }
      
      const newBooking = await createBooking({
        userId: user.id,
        salonId: bookingData.salonId,
        salonName: bookingData.salonName,
        serviceName: bookingData.services.map((s: any) => s.name).join(", "),
        date: new Date(bookingData.date).toISOString().split('T')[0],
        timeSlot: bookingData.timeSlot,
        email: values.email,
        phone: values.phone,
        totalPrice: bookingData.totalPrice,
        totalDuration: bookingData.totalDuration,
        slotId: slotCheck.slotId,
        notes: values.notes
      });
      
      const payment = await createPayment({
        bookingId: newBooking.id,
        userId: user.id,
        amount: bookingData.totalPrice,
        paymentMethod: values.paymentMethod,
        paymentStatus: "completed",
        transactionId: `AUTO-${Math.floor(Math.random() * 1000000)}`
      });
      
      await bookSlot(slotCheck.slotId);
      
      toast({
        title: "Booking Successful!",
        description: "Your appointment has been confirmed.",
      });
      
      showBookingSuccessNotification({
        ...bookingData,
        date: new Date(bookingData.date),
        timeSlot: bookingData.timeSlot
      });
      
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
