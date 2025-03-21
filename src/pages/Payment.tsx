
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  User, 
  Phone, 
  Mail,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { useAuth } from '@/context/AuthContext';

const paymentSchema = z.object({
  cardName: z.string().min(3, "Cardholder name is required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Valid email is required"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get booking data from location state
  const bookingData = location.state;
  
  // If no booking data, redirect to book now page
  if (!bookingData) {
    navigate('/book-now');
    return null;
  }
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      phone: userProfile?.phoneNumber || "",
      email: user?.email || "",
    },
  });
  
  const handlePayment = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would process payment and create booking in Supabase
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: "Your appointment has been booked!",
      });
      
      // Navigate to confirmation page
      navigate('/booking-confirmation', { 
        state: {
          ...bookingData,
          bookingId: `BK-${Math.floor(Math.random() * 10000)}`, // Mock booking ID
          paymentDetails: {
            cardName: values.cardName,
            cardNumber: values.cardNumber.slice(-4).padStart(16, '*'),
            expiryDate: values.expiryDate
          }
        }
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 16);
  };
  
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Summary */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="glass-card p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className={`rounded-md p-2 mr-3 ${
                          bookingData.salonName.includes("Men") || bookingData.salonName.includes("Barber") 
                            ? "bg-salon-men/10 text-salon-men" 
                            : "bg-salon-women/10 text-salon-women"
                        }`}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{bookingData.salonName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {bookingData.services.length} service(s) selected
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {bookingData.date && format(new Date(bookingData.date), "EEEE, MMMM d, yyyy")}
                          </h3>
                          <p className="text-sm text-muted-foreground">Appointment date</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{bookingData.timeSlot}</h3>
                          <p className="text-sm text-muted-foreground">
                            Duration: {bookingData.totalDuration} min
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-3">Selected Services</h3>
                        <ul className="space-y-2">
                          {bookingData.services.map((service: any, index: number) => (
                            <li key={index} className="flex justify-between text-sm">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                <span>{service.name}</span>
                              </div>
                              <span className="font-medium">${service.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Total Amount</h3>
                          <p className="text-sm text-muted-foreground">
                            Including all services
                          </p>
                        </div>
                        <div className="text-2xl font-bold">${bookingData.totalPrice}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Payment Form */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="glass-card p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cardholder Name</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      placeholder="John Doe"
                                      {...field}
                                      className="pl-10"
                                    />
                                  </FormControl>
                                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      placeholder="1234 5678 9012 3456"
                                      {...field}
                                      value={formatCardNumber(field.value)}
                                      onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                                      className="pl-10"
                                    />
                                  </FormControl>
                                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        placeholder="MM/YY"
                                        {...field}
                                        value={formatExpiryDate(field.value)}
                                        onChange={(e) => field.onChange(formatExpiryDate(e.target.value))}
                                        className="pl-10"
                                      />
                                    </FormControl>
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input
                                        type="password"
                                        placeholder="123"
                                        {...field}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/\D/g, '');
                                          field.onChange(value.slice(0, 4));
                                        }}
                                        className="pl-10"
                                      />
                                    </FormControl>
                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <h3 className="font-medium mb-2">Contact Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      placeholder="+1 (123) 456-7890"
                                      {...field}
                                      className="pl-10"
                                    />
                                  </FormControl>
                                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      placeholder="your@email.com"
                                      {...field}
                                      className="pl-10"
                                    />
                                  </FormControl>
                                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="pt-2">
                          <AnimatedButton
                            type="submit"
                            variant="gradient"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Pay ${bookingData.totalPrice}</>
                            )}
                          </AnimatedButton>
                        </div>
                      </form>
                    </Form>
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
