import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Scissors, 
  PlusCircle,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type MerchantData = {
  id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
};

type SlotData = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

type BookingData = {
  id: string;
  user_id: string;
  slot_id: string;
  service_name: string;
  status: string;
  created_at: string;
  user_profile?: {
    username: string;
    phone_number?: string;
  } | null;
  slot?: {
    date: string;
    start_time: string;
    end_time: string;
  };
};

const MerchantDashboard = () => {
  const { user, userProfile, isMerchant } = useAuth();
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [isLoading, setIsLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in and is a merchant
    if (user === null) {
      // Not logged in
      navigate('/auth');
      return;
    }
    
    if (user && !isMerchant) {
      // Logged in but not a merchant
      toast({
        title: "Access Denied",
        description: "This page is only available to merchant accounts.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    if (user && isMerchant) {
      // Load merchant data
      loadMerchantData();
    }
  }, [user, isMerchant, navigate]);

  const loadMerchantData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch merchant profile data
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (merchantError) {
        throw merchantError;
      }
      
      if (merchantData) {
        setMerchantData(merchantData);
        
        // Fetch slots
        const { data: slotsData, error: slotsError } = await supabase
          .from('slots')
          .select('*')
          .eq('merchant_id', user.id)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });
          
        if (slotsError) {
          throw slotsError;
        }
        
        setSlots(slotsData || []);
        
        // Fetch bookings first
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('merchant_id', user.id);
          
        if (bookingsError) {
          throw bookingsError;
        }
        
        // Process bookings to add user profile and slot info
        const enhancedBookings: BookingData[] = [];
        
        for (const booking of bookingsData || []) {
          // Fetch user profile separately
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, phone_number')
            .eq('id', booking.user_id)
            .single();
            
          // Fetch slot info separately
          const { data: slotData } = await supabase
            .from('slots')
            .select('date, start_time, end_time')
            .eq('id', booking.slot_id)
            .single();
            
          enhancedBookings.push({
            ...booking,
            user_profile: profileData || { username: 'Unknown User' },
            slot: slotData || undefined
          });
        }
        
        setBookings(enhancedBookings);
      } else {
        // Merchant profile not found, redirect to merchant signup
        toast({
          title: "Complete Your Profile",
          description: "Please complete your merchant profile first.",
        });
        navigate('/merchant-signup');
      }
    } catch (error: any) {
      console.error('Error loading merchant data:', error);
      toast({
        title: "Failed to Load Data",
        description: error.message || "An error occurred while loading your merchant dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSlot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSlot = async () => {
    if (!user || !merchantData) return;
    
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast({
        title: "Missing Information",
        description: "Please provide all required slot details.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('slots')
        .insert({
          merchant_id: user.id,
          date: newSlot.date,
          start_time: newSlot.startTime,
          end_time: newSlot.endTime,
          is_booked: false
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setSlots(prev => [...prev, data[0]]);
        setNewSlot({
          date: '',
          startTime: '',
          endTime: '',
        });
        
        toast({
          title: "Slot Created",
          description: "Your new availability slot has been added.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to Create Slot",
        description: error.message || "An error occurred while creating the slot.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      
      toast({
        title: "Booking Updated",
        description: `Booking status updated to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Update Booking",
        description: error.message || "An error occurred while updating the booking.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    // Format time from 24-hour to 12-hour
    const timeParts = timeString.split(':');
    let hour = parseInt(timeParts[0]);
    const min = timeParts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12
    return `${hour}:${min} ${ampm}`;
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin mb-4 mx-auto h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
              <p>Loading your merchant dashboard...</p>
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
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-heading">Merchant Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your bookings, availability, and business profile
                </p>
              </div>
              
              <AnimatedButton 
                variant="outline" 
                onClick={() => loadMerchantData()}
                icon={<Calendar className="w-4 h-4 mr-2" />}
              >
                Refresh Data
              </AnimatedButton>
            </div>
            
            {merchantData && (
              <div className="mb-8">
                <Card className="bg-salon-women/5 dark:bg-salon-women-light/5 border-salon-women/20 dark:border-salon-women-light/20">
                  <CardHeader className="pb-3">
                    <CardTitle>{merchantData.business_name}</CardTitle>
                    <CardDescription>
                      {merchantData.service_category.charAt(0).toUpperCase() + merchantData.service_category.slice(1)} Salon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{userProfile?.username || 'Owner'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{slots.length} Time Slots Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{bookings.length} Total Bookings</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="grid grid-cols-1 md:grid-cols-3">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="settings">Business Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>
                      Manage your scheduled appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Appointments Yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          You don't have any bookings yet. Make sure you've added availability slots for customers to book.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {bookings.map((booking) => (
                          <Card key={booking.id} className="overflow-hidden">
                            <div className={`h-1.5 w-full 
                              ${booking.status === 'confirmed' ? 'bg-green-500' : 
                                booking.status === 'pending' ? 'bg-yellow-500' : 
                                'bg-red-500'}`}
                            />
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Customer</p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{booking.user_profile?.username || 'Customer'}</p>
                                      <p className="text-xs text-muted-foreground">{booking.user_profile?.phone_number || 'No phone'}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Date & Time</p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <CalendarDays className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {booking.slot?.date ? formatDate(booking.slot.date) : 'N/A'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {booking.slot?.start_time ? 
                                          `${formatTime(booking.slot.start_time)} - ${formatTime(booking.slot.end_time)}` : 
                                          'Time not specified'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">Service & Status</p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Scissors className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{booking.service_name || 'Service'}</p>
                                      <div className="mt-1">
                                        {getStatusBadge(booking.status)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 md:text-right flex md:block gap-2">
                                  <p className="text-sm font-medium md:mb-2">Actions</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {booking.status === 'pending' && (
                                      <>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                          onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                        >
                                          <CheckCircle2 className="h-4 w-4 mr-1" />
                                          Confirm
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
                                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Cancel
                                        </Button>
                                      </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    )}
                                    {booking.status === 'cancelled' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                        onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                      >
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        Restore
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Availability</CardTitle>
                    <CardDescription>
                      Add and manage your available time slots
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-6 border rounded-lg bg-background">
                      <h3 className="font-medium text-lg mb-4">Add New Time Slot</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input 
                            id="date" 
                            name="date" 
                            type="date" 
                            value={newSlot.date}
                            onChange={handleNewSlotChange}
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input 
                            id="startTime" 
                            name="startTime" 
                            type="time" 
                            value={newSlot.startTime}
                            onChange={handleNewSlotChange}
                            className="mt-1" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">End Time</Label>
                          <Input 
                            id="endTime" 
                            name="endTime" 
                            type="time" 
                            value={newSlot.endTime}
                            onChange={handleNewSlotChange}
                            className="mt-1" 
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        onClick={handleCreateSlot}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Your Available Slots</h3>
                      
                      {slots.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg">
                          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-lg mb-2">No Time Slots Added</h3>
                          <p className="text-muted-foreground max-w-sm mx-auto">
                            Add time slots above so customers can book appointments with you.
                          </p>
                        </div>
                      ) : (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-4 gap-4 bg-muted p-4 font-medium">
                            <div>Date</div>
                            <div>Start Time</div>
                            <div>End Time</div>
                            <div>Status</div>
                          </div>
                          <div className="divide-y">
                            {slots.map((slot) => (
                              <div key={slot.id} className="grid grid-cols-4 gap-4 p-4">
                                <div>{formatDate(slot.date)}</div>
                                <div>{formatTime(slot.start_time)}</div>
                                <div>{formatTime(slot.end_time)}</div>
                                <div>
                                  {slot.is_booked ? (
                                    <Badge>Booked</Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-green-500 text-green-600">
                                      Available
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      Review and update your business details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {merchantData && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input 
                              id="business_name" 
                              value={merchantData.business_name} 
                              readOnly 
                              className="mt-1 bg-muted" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="service_category">Service Category</Label>
                            <Input 
                              id="service_category" 
                              value={`${merchantData.service_category.charAt(0).toUpperCase() + merchantData.service_category.slice(1)} Salon`} 
                              readOnly 
                              className="mt-1 bg-muted" 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="business_address">Address</Label>
                          <Input 
                            id="business_address" 
                            value={merchantData.business_address} 
                            readOnly 
                            className="mt-1 bg-muted" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="business_email">Email</Label>
                            <Input 
                              id="business_email" 
                              value={merchantData.business_email} 
                              readOnly 
                              className="mt-1 bg-muted" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="business_phone">Phone</Label>
                            <Input 
                              id="business_phone" 
                              value={merchantData.business_phone} 
                              readOnly 
                              className="mt-1 bg-muted" 
                            />
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            To update your business information, please contact support.
                          </p>
                          
                          <Button disabled variant="outline" className="w-full sm:w-auto">
                            <Settings className="h-4 w-4 mr-2" />
                            Request Information Update
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MerchantDashboard;
