import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ServiceSelector from '@/components/booking/ServiceSelector';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { 
  getAvailableTimeSlots, 
  formatSlotsForDisplay,
  subscribeToSlotUpdates 
} from '@/utils/slotUtils';

const mockSalonData = {
  "1": {
    id: "1",
    name: "Modern Cuts",
    rating: 4.8,
    reviewCount: 204,
    address: "123 Broadway St, New York, NY",
    distance: "0.8 mi",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    description: "Modern Cuts is a premium salon offering top-notch services for men. Our skilled barbers provide expert haircuts, beard trims, and grooming services in a stylish and relaxed environment.",
    services: [
      { id: "s1", name: "Men's Haircut", price: 35, duration: 30, description: "Classic or modern haircut tailored to your style" },
      { id: "s2", name: "Beard Trim", price: 15, duration: 15, description: "Precise beard trimming and shaping" },
      { id: "s3", name: "Hair Wash & Style", price: 25, duration: 20, description: "Thorough wash with styling" },
      { id: "s4", name: "Hot Towel Shave", price: 30, duration: 25, description: "Traditional hot towel shave for a smooth finish" },
      { id: "s5", name: "Hair Coloring", price: 60, duration: 60, description: "Professional hair coloring services" }
    ],
    openingTime: "9:00 AM",
    closingTime: "7:00 PM",
    type: "men"
  },
  "2": {
    id: "2",
    name: "Elegance Hair Studio",
    rating: 4.6,
    reviewCount: 178,
    address: "456 5th Avenue, New York, NY",
    distance: "1.2 mi",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    description: "Elegance Hair Studio specializes in women's hair services, offering everything from trendy cuts to stunning coloring and styling. Our expert stylists are committed to enhancing your natural beauty.",
    services: [
      { id: "s6", name: "Women's Haircut", price: 55, duration: 45, description: "Precision cut with style consultation" },
      { id: "s7", name: "Blow Dry & Style", price: 40, duration: 30, description: "Professional blow dry with styling" },
      { id: "s8", name: "Hair Coloring", price: 95, duration: 90, description: "Full hair coloring with premium products" },
      { id: "s9", name: "Deep Conditioning", price: 35, duration: 30, description: "Intensive hair treatment for damaged hair" },
      { id: "s10", name: "Updo", price: 70, duration: 60, description: "Elegant updo styling for special occasions" }
    ],
    openingTime: "8:00 AM",
    closingTime: "8:00 PM",
    type: "women"
  },
  "3": {
    id: "3",
    name: "The Barber Room",
    rating: 4.9,
    reviewCount: 312,
    address: "789 Washington St, New York, NY",
    distance: "0.5 mi",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    description: "The Barber Room provides exceptional grooming services for men in a classic barbershop atmosphere with modern amenities. Our master barbers take pride in delivering precision cuts and immaculate service.",
    services: [
      { id: "s11", name: "Premium Haircut", price: 45, duration: 40, description: "Premium haircut with hot towel refresh" },
      { id: "s12", name: "Beard Styling", price: 25, duration: 20, description: "Expert beard shaping and styling" },
      { id: "s13", name: "Full Service", price: 65, duration: 60, description: "Complete package: haircut, beard trim, and styling" },
      { id: "s14", name: "Kid's Haircut", price: 25, duration: 20, description: "Gentle haircuts for children" },
      { id: "s15", name: "Senior's Cut", price: 30, duration: 30, description: "Specialized service for senior gentlemen" }
    ],
    openingTime: "10:00 AM",
    closingTime: "9:00 PM",
    type: "men"
  },
  "4": {
    id: "4",
    name: "Beauty & Beyond",
    rating: 4.7,
    reviewCount: 156,
    address: "321 Madison Ave, New York, NY",
    distance: "1.5 mi",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    description: "Beauty & Beyond is a luxury salon specializing in women's beauty services. From premium haircuts to manicures and facials, our expert staff provides a comprehensive range of treatments.",
    services: [
      { id: "s16", name: "Women's Cut & Style", price: 60, duration: 50, description: "Expert cut and professional styling" },
      { id: "s17", name: "Manicure", price: 35, duration: 30, description: "Classic manicure with polish" },
      { id: "s18", name: "Pedicure", price: 45, duration: 40, description: "Relaxing pedicure with polish" },
      { id: "s19", name: "Facial", price: 75, duration: 60, description: "Rejuvenating facial treatment" },
      { id: "s20", name: "Hair Treatment", price: 55, duration: 45, description: "Nourishing hair treatment" }
    ],
    openingTime: "9:00 AM",
    closingTime: "7:00 PM",
    type: "women"
  },
  "5": {
    id: "5",
    name: "Unisex Style Studio",
    rating: 4.5,
    reviewCount: 124,
    address: "555 Lexington Ave, New York, NY",
    distance: "0.9 mi",
    image: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    description: "Unisex Style Studio welcomes all clients seeking quality hair services. Our versatile stylists are skilled in a wide range of cutting and styling techniques for all hair types and preferences.",
    services: [
      { id: "s21", name: "Men's Haircut", price: 40, duration: 35, description: "Professional men's haircut" },
      { id: "s22", name: "Women's Haircut", price: 55, duration: 45, description: "Professional women's haircut" },
      { id: "s23", name: "Styling", price: 35, duration: 30, description: "Hair styling without cut" },
      { id: "s24", name: "Color Treatment", price: 85, duration: 90, description: "Professional color service" },
      { id: "s25", name: "Children's Cut", price: 30, duration: 25, description: "Haircuts for children under 12" }
    ],
    openingTime: "8:30 AM",
    closingTime: "8:30 PM",
    type: "unisex"
  },
  "6": {
    id: "6",
    name: "The Hair Lounge",
    rating: 4.4,
    reviewCount: 98,
    address: "888 Park Ave, New York, NY",
    distance: "2.1 mi",
    image: "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    description: "The Hair Lounge offers a premium salon experience with a focus on cutting-edge styles and techniques. Our talented team specializes in hair transformations that boost confidence and enhance your natural beauty.",
    services: [
      { id: "s26", name: "Premium Cut", price: 50, duration: 45, description: "High-end cutting service" },
      { id: "s27", name: "Hair Treatment", price: 70, duration: 60, description: "Specialized treatment for damaged hair" },
      { id: "s28", name: "Bridal Styling", price: 120, duration: 120, description: "Complete bridal hair service" },
      { id: "s29", name: "Extensions", price: 200, duration: 180, description: "Professional hair extension service" },
      { id: "s30", name: "Balayage", price: 150, duration: 150, description: "Custom balayage coloring technique" }
    ],
    openingTime: "10:00 AM",
    closingTime: "6:00 PM",
    type: "unisex"
  }
};

const SalonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [salon, setSalon] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  
  useEffect(() => {
    if (id) {
      const salonData = mockSalonData[id as keyof typeof mockSalonData];
      if (salonData) {
        setSalon(salonData);
      } else {
        toast({
          title: "Salon not found",
          description: "We couldn't find details for this salon.",
          variant: "destructive",
        });
        navigate('/book-now');
      }
      setLoading(false);
    }
  }, [id, navigate, toast]);
  
  useEffect(() => {
    let channel: any = null;
    
    const fetchSlots = async () => {
      if (selectedDate && id) {
        setFetchingSlots(true);
        try {
          const slots = await getAvailableTimeSlots(id, selectedDate);
          setTimeSlots(formatSlotsForDisplay(slots));
          
          channel = subscribeToSlotUpdates(id, format(selectedDate, "yyyy-MM-dd"), (updatedSlots) => {
            setTimeSlots(updatedSlots);
            
            if (selectedSlot) {
              const slotStillAvailable = updatedSlots.some(
                (slot) => slot.id === selectedSlot && slot.available
              );
              if (!slotStillAvailable) {
                setSelectedSlot(null);
                toast({
                  title: "Slot no longer available",
                  description: "The time slot you selected has been booked by someone else. Please select another time.",
                  variant: "destructive",
                });
              }
            }
          });
        } catch (error) {
          console.error("Error fetching slots:", error);
          toast({
            title: "Error loading slots",
            description: "There was an error loading available time slots. Please try again.",
            variant: "destructive",
          });
        } finally {
          setFetchingSlots(false);
        }
      }
    };
    
    fetchSlots();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedDate, id, toast, selectedSlot]);
  
  const handleServiceToggle = (selectedIds: string[]) => {
    setSelectedServices(selectedIds);
  };
  
  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };
  
  const calculateTotalPrice = () => {
    if (!salon) return 0;
    return salon.services
      .filter((service: any) => selectedServices.includes(service.id))
      .reduce((total: number, service: any) => total + service.price, 0);
  };
  
  const calculateTotalDuration = () => {
    if (!salon) return 0;
    return salon.services
      .filter((service: any) => selectedServices.includes(service.id))
      .reduce((total: number, service: any) => total + service.duration, 0);
  };
  
  const handleProceedToPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an appointment.",
        variant: "destructive",
      });
      navigate('/auth', { state: { redirectTo: `/book/${id}` } });
      return;
    }
    
    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedSlot) {
      toast({
        title: "No Time Slot Selected",
        description: "Please select a time slot for your appointment.",
        variant: "destructive",
      });
      return;
    }

    const selectedSlotDetails = timeSlots.find((slot: any) => slot.id === selectedSlot);
    
    if (!selectedSlotDetails || !selectedSlotDetails.available) {
      toast({
        title: "Slot No Longer Available",
        description: "This time slot is no longer available. Please select another time.",
        variant: "destructive",
      });
      return;
    }

    navigate(`/payment`, { 
      state: { 
        salonId: id,
        salonName: salon?.name,
        services: selectedServices.map(serviceId => 
          salon?.services.find((s: any) => s.id === serviceId)
        ),
        date: selectedDate,
        timeSlot: selectedSlotDetails.time,
        totalPrice: calculateTotalPrice(),
        totalDuration: calculateTotalDuration(),
        slotId: selectedSlot
      } 
    });
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!salon) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-20 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Salon Not Found</h2>
              <p className="text-muted-foreground mb-6">We couldn't find the salon you're looking for.</p>
              <AnimatedButton variant="default" onClick={() => navigate('/book-now')}>
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
          <section className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={salon.image} 
                alt={salon.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white max-w-3xl"
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{salon.name}</h1>
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-400 text-yellow-900 rounded px-2 py-0.5 text-sm font-semibold mr-2">
                      {salon.rating.toFixed(1)}
                    </div>
                    <span className="text-sm">({salon.reviewCount} reviews)</span>
                  </div>
                  <p className="text-sm md:text-base opacity-90">{salon.address}</p>
                </motion.div>
              </div>
            </div>
          </section>
          
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card p-6 rounded-lg mb-6"
                  >
                    <h2 className="text-xl font-semibold mb-4">About {salon.name}</h2>
                    <p className="text-muted-foreground mb-4">{salon.description}</p>
                    
                    <div className="border-t border-border pt-4 mt-4">
                      <div className="flex items-start mb-3">
                        <Clock className="w-5 h-5 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">Business Hours</h3>
                          <p className="text-sm text-muted-foreground">
                            {salon.openingTime} - {salon.closingTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="sticky top-28"
                  >
                    <div className="glass-card p-6 rounded-lg">
                      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                      
                      {selectedServices.length > 0 ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Selected Services</h3>
                            <ul className="space-y-2">
                              {salon.services
                                .filter((service: any) => selectedServices.includes(service.id))
                                .map((service: any) => (
                                  <li key={service.id} className="flex justify-between text-sm">
                                    <span>{service.name}</span>
                                    <span className="font-medium">${service.price}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                          
                          <div className="border-t border-border pt-4">
                            <div className="flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-bold">${calculateTotalPrice()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span>Duration</span>
                              <span>{calculateTotalDuration()} min</span>
                            </div>
                          </div>
                          
                          <AnimatedButton
                            variant={salon.type === 'men' ? 'men' : 'women'}
                            className="w-full"
                            onClick={handleProceedToPayment}
                          >
                            Proceed to Payment
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </AnimatedButton>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          <p>Select services to see booking summary</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card p-6 rounded-lg mb-6"
                  >
                    <h2 className="text-xl font-semibold mb-4">Select Services</h2>
                    <ServiceSelector
                      services={salon.services}
                      selectedServices={selectedServices}
                      onChange={handleServiceToggle}
                      salonType={salon.type as 'men' | 'women' | 'unisex'}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-card p-6 rounded-lg"
                  >
                    <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-3">Date</h3>
                        <div className="bg-background/40 rounded-lg p-3">
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className={cn(
                                  "w-full flex items-center justify-between p-3 rounded-md border",
                                  "text-left font-normal",
                                  "focus:outline-none focus:ring-2 focus:ring-primary"
                                )}
                              >
                                {selectedDate ? (
                                  format(selectedDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="h-4 w-4 opacity-50" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) => 
                                  date < new Date() || 
                                  date > new Date(new Date().setDate(new Date().getDate() + 30))
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Time</h3>
                        <div className="bg-background/40 rounded-lg p-3 max-h-64 overflow-y-auto">
                          {fetchingSlots ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                                  className={cn(
                                    "p-2 rounded-md text-sm flex items-center justify-center",
                                    slot.available ? (
                                      selectedSlot === slot.id
                                        ? salon.type === 'men'
                                          ? "bg-salon-men text-white"
                                          : "bg-salon-women text-white"
                                        : "border hover:border-primary"
                                    ) : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                                  )}
                                  disabled={!slot.available}
                                >
                                  {slot.time}
                                  {selectedSlot === slot.id && (
                                    <CheckCircle className="ml-1 h-3 w-3" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default SalonDetails;
