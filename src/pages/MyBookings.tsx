
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, AlertCircle, Check, X, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserBookings, updateBookingStatus } from '@/utils/bookingUtils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view your bookings",
        variant: "destructive",
      });
      navigate('/auth', { state: { redirectTo: '/my-bookings' } });
      return;
    }
    
    fetchBookings();
  }, [user, navigate, toast]);
  
  const fetchBookings = async () => {
    setLoading(true);
    
    try {
      if (!user) return;
      
      const bookingsData = await fetchUserBookings(user.id);
      
      // If no bookings yet, show some sample ones for demo purposes
      if (bookingsData && bookingsData.length > 0) {
        setBookings(bookingsData);
      } else {
        // Fallback to mock data if no bookings exist
        setBookings(getMockBookings());
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error fetching bookings",
        description: "We couldn't load your bookings. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  const getMockBookings = () => {
    return [
      {
        id: "1",
        salon_name: "Modern Cuts",
        salon_id: "1",
        service_name: "Men's Haircut",
        service_price: 35,
        service_duration: 30,
        booking_date: new Date().toISOString(),
        time_slot: "14:00",
        status: "upcoming",
        customer_email: user?.email,
        customer_phone: "",
        merchant_id: "1"
      },
      {
        id: "2",
        salon_name: "Elegance Hair Studio",
        salon_id: "2",
        service_name: "Women's Haircut, Blow Dry & Style",
        service_price: 95,
        service_duration: 75,
        booking_date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        time_slot: "11:30",
        status: "upcoming",
        customer_email: user?.email,
        customer_phone: "",
        merchant_id: "2"
      },
      {
        id: "3",
        salon_name: "The Barber Room",
        salon_id: "3",
        service_name: "Premium Haircut",
        service_price: 45,
        service_duration: 40,
        booking_date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        time_slot: "10:00",
        status: "completed",
        customer_email: user?.email,
        customer_phone: "",
        merchant_id: "3"
      }
    ];
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, "cancelled");
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "cancelled" } 
          : booking
      ));
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error cancelling booking",
        description: "We couldn't cancel your booking. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleRescheduleBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      console.log("Rescheduling booking:", booking);
      // Store the booking ID in session storage for retrieval on the booking page
      sessionStorage.setItem('rescheduleBookingId', bookingId);
      navigate(`/book/${booking.salon_id || booking.merchant_id}`, { 
        state: { 
          reschedule: true, 
          bookingId: bookingId 
        } 
      });
    }
  };
  
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "upcoming") {
      return booking.status === "upcoming";
    } else if (activeTab === "completed") {
      return booking.status === "completed";
    } else if (activeTab === "cancelled") {
      return booking.status === "cancelled";
    }
    return true;
  });
  
  const renderBookingCard = (booking: any) => {
    const isPast = new Date(booking.booking_date) < new Date();
    const isCancelled = booking.status === "cancelled";
    
    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`glass-card p-5 rounded-lg border ${
          isCancelled
            ? "border-destructive/30 bg-destructive/5"
            : isPast
              ? "border-muted"
              : "border-border"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{booking.salon_name}</h3>
            <p className="text-sm text-muted-foreground">Ref: {booking.id.substring(0, 8)}</p>
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
            isCancelled
              ? "bg-destructive/10 text-destructive"
              : booking.status === "completed"
                ? "bg-green-500/10 text-green-500"
                : "bg-primary/10 text-primary"
          }`}>
            {isCancelled
              ? "Cancelled"
              : booking.status === "completed"
                ? "Completed"
                : "Upcoming"}
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-start">
            <Calendar className="w-4 h-4 mt-1 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {format(new Date(booking.booking_date), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">Date</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Clock className="w-4 h-4 mt-1 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{booking.time_slot}</p>
              <p className="text-xs text-muted-foreground">
                Duration: {booking.service_duration} min
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mt-1 mr-2 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Salon Location</p>
              <p className="text-xs text-muted-foreground">Address information</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border pt-3">
          <h4 className="font-medium text-sm mb-2">Service(s):</h4>
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-sm">
              <span>{booking.service_name}</span>
              <span className="font-medium">${booking.service_price}</span>
            </div>
          </div>
          <div className="flex justify-between font-medium text-sm">
            <span>Total:</span>
            <span>${booking.service_price}</span>
          </div>
        </div>
        
        {!isCancelled && !isPast && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleRescheduleBooking(booking.id)}
            >
              Reschedule
            </AnimatedButton>
            <AnimatedButton
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => handleCancelBooking(booking.id)}
            >
              Cancel
            </AnimatedButton>
          </div>
        )}
        
        {isPast && booking.status === "completed" && (
          <div className="mt-4 pt-3 border-t border-border">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate(`/book/${booking.salon_id || booking.merchant_id}`)}
            >
              Book Again
            </AnimatedButton>
          </div>
        )}
      </motion.div>
    );
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-3xl">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/book-now')}
                >
                  Book New Appointment
                </AnimatedButton>
              </div>
              
              <Tabs 
                defaultValue="upcoming" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBookings.map(renderBookingCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any upcoming salon appointments.
                      </p>
                      <AnimatedButton 
                        variant="default" 
                        onClick={() => navigate('/book-now')}
                      >
                        Book an Appointment
                      </AnimatedButton>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBookings.map(renderBookingCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                      <Check className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-2">No completed bookings</h3>
                      <p className="text-muted-foreground">
                        You don't have any completed salon appointments yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="cancelled" className="mt-0">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                      {filteredBookings.map(renderBookingCard)}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                      <X className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-medium mb-2">No cancelled bookings</h3>
                      <p className="text-muted-foreground">
                        You don't have any cancelled salon appointments.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MyBookings;
