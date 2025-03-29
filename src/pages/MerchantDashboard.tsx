
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AppointmentsList from '@/components/merchant/AppointmentsList';
import DashboardMetrics from '@/components/merchant/DashboardMetrics';
import SlotManager from '@/components/merchant/SlotManager';
import PageTransition from '@/components/transitions/PageTransition';
import { format } from 'date-fns';

const MerchantDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { user, userProfile, isMerchant, loading, session } = useAuth();
  const [merchantData, setMerchantData] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [merchantStatus, setMerchantStatus] = useState<string | null>(
    window.localStorage.getItem('merchant_status')
  );
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication and merchant status on load
  useEffect(() => {
    const checkAuth = async () => {
      console.log("MerchantDashboard - Checking auth state, loading:", loading);
      console.log("MerchantDashboard - User:", user?.id);
      console.log("MerchantDashboard - Is merchant:", isMerchant);
      console.log("MerchantDashboard - Merchant status:", merchantStatus);
      
      if (loading) {
        return; // Wait until auth state is fully loaded
      }

      // Get cached merchant status first
      const storedMerchantStatus = window.localStorage.getItem('merchant_status');
      
      if (!user) {
        console.log("MerchantDashboard - No user, checking for session");
        // Try to get session directly as a fallback
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("MerchantDashboard - No session, redirecting to login");
          navigate('/merchant-login');
          return;
        }
      }
      
      // Double-check merchant status if user exists but isMerchant flag is false
      if (user && !isMerchant) {
        console.log("MerchantDashboard - User exists but isMerchant is false, checking profile");
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_merchant')
            .eq('id', user.id)
            .single();
            
          if (!profileData?.is_merchant) {
            console.log("MerchantDashboard - User is not a merchant, redirecting");
            toast({
              title: "Access Denied",
              description: "This page is only available to merchant accounts.",
              variant: "destructive",
            });
            navigate('/');
            return;
          } else {
            console.log("MerchantDashboard - User confirmed as merchant from profile check");
            // User is a merchant according to the database, update local state
            window.localStorage.setItem('is_merchant', 'true');
          }
        } catch (error) {
          console.error("Error checking merchant status:", error);
          toast({
            title: "Access Error",
            description: "There was an error verifying your account status. Please try again.",
            variant: "destructive",
          });
          navigate('/merchant-login');
          return;
        }
      }
      
      // Check for specific merchant status
      if (user) {
        if (storedMerchantStatus === 'pending') {
          console.log("MerchantDashboard - Merchant status is pending, redirecting");
          navigate('/merchant-pending');
          return;
        } else if (storedMerchantStatus === 'rejected') {
          console.log("MerchantDashboard - Merchant application was rejected");
          toast({
            title: "Application Rejected",
            description: "Your merchant application has been rejected. Please contact support for more information.",
            variant: "destructive",
          });
          navigate('/');
          return;
        } else if (!storedMerchantStatus || storedMerchantStatus !== 'approved') {
          console.log("MerchantDashboard - Checking merchant status from database");
          // If we don't have a stored status, check the database
          try {
            const { data: merchantData, error } = await supabase
              .from('merchants')
              .select('status')
              .eq('id', user.id)
              .single();
              
            if (error) {
              console.error("Error fetching merchant status:", error);
              toast({
                title: "Error",
                description: "Could not verify merchant status. Please try again.",
                variant: "destructive",
              });
              navigate('/merchant-login');
              return;
            }
            
            if (merchantData) {
              console.log("MerchantDashboard - Retrieved merchant status:", merchantData.status);
              window.localStorage.setItem('merchant_status', merchantData.status);
              setMerchantStatus(merchantData.status);
              
              if (merchantData.status === 'pending') {
                navigate('/merchant-pending');
                return;
              } else if (merchantData.status === 'rejected') {
                toast({
                  title: "Application Rejected",
                  description: "Your merchant application has been rejected. Please contact support for more information.",
                  variant: "destructive",
                });
                navigate('/');
                return;
              }
            } else {
              console.log("MerchantDashboard - No merchant data found");
              toast({
                title: "Account Error",
                description: "Could not find your merchant account. Please contact support.",
                variant: "destructive",
              });
              navigate('/merchant-login');
              return;
            }
          } catch (error) {
            console.error("Error in merchant status check:", error);
            toast({
              title: "Error",
              description: "There was an error verifying your account. Please try again.",
              variant: "destructive",
            });
            navigate('/merchant-login');
            return;
          }
        }
      }
      
      loadMerchantData();
    };
    
    checkAuth();
  }, [user, isMerchant, loading, navigate, toast]);
  
  // Load merchant data after authentication check is complete
  const loadMerchantData = async () => {
    setIsLoading(true);
    
    try {
      if (!user) {
        console.error("No user available to load merchant data");
        return;
      }
      
      console.log("Loading merchant data for user:", user.id);
      
      // Load merchant profile data
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (merchantError) {
        console.error("Error loading merchant data:", merchantError);
        toast({
          title: "Data Error",
          description: "Could not load your merchant profile. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setMerchantData(merchantData);
      
      // Load slots data
      const { data: slotsData, error: slotsError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('merchant_id', user.id);
        
      if (slotsError) {
        console.error("Error loading slots data:", slotsError);
        toast({
          title: "Data Error",
          description: "Could not load your time slots. Please try again.",
          variant: "destructive",
        });
      } else {
        setSlots(slotsData || []);
      }
      
      // Load bookings data with user profiles
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          user_profile:user_id(username, phone_number),
          slot:slot_id(date, start_time, end_time)
        `)
        .eq('merchant_id', user.id);
        
      if (bookingsError) {
        console.error("Error loading bookings data:", bookingsError);
        toast({
          title: "Data Error",
          description: "Could not load your bookings. Please try again.",
          variant: "destructive",
        });
      } else {
        setBookings(bookingsData || []);
      }
    } catch (error) {
      console.error("Error in loadMerchantData:", error);
      toast({
        title: "Error",
        description: "There was an error loading your merchant data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMerchantData().finally(() => {
      setIsRefreshing(false);
    });
  };
  
  // Metrics calculations
  const processedAppointments = useMemo(() => {
    return bookings.map(booking => ({
      id: booking.id,
      customerName: booking.user_profile?.username || 'Unknown User',
      service: booking.service_name,
      date: booking.booking_date || booking.slot?.date,
      time: booking.time_slot || booking.slot?.start_time,
      duration: `${booking.service_duration || 30} min`,
      status: (booking.status === 'confirmed' 
        ? 'confirmed' 
        : booking.status === 'cancelled' 
          ? 'cancelled' 
          : 'pending') as 'pending' | 'confirmed' | 'cancelled'
    }));
  }, [bookings]);
  
  const processedSlots = useMemo(() => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const filteredSlots = slots.filter(slot => slot.date === formattedDate);
    
    return filteredSlots.map(slot => ({
      id: slot.id,
      day: new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' }),
      time: slot.start_time,
      status: slot.is_booked ? 'booked' : 'available' as 'available' | 'booked' | 'unavailable'
    }));
  }, [slots, selectedDate]);
  
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalAppointments: bookings.length,
      todayAppointments: bookings.filter(b => (b.booking_date === today || b.slot?.date === today)).length,
      totalClients: [...new Set(bookings.map(b => b.user_id))].length,
      availableSlots: slots.filter(s => !s.is_booked).length
    };
  }, [bookings, slots]);
  
  if (loading || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="flex h-screen">
        <MerchantSidebar />
        
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
              <p className="text-muted-foreground">
                {merchantData?.business_name && `Welcome, ${merchantData.business_name}`}
              </p>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
          
          <Tabs value={activeTab} defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-5 max-w-xl">
              <TabsTrigger value="overview" onClick={() => navigate('/merchant-dashboard?tab=overview')}>Overview</TabsTrigger>
              <TabsTrigger value="appointments" onClick={() => navigate('/merchant-dashboard?tab=appointments')}>Appointments</TabsTrigger>
              <TabsTrigger value="availability" onClick={() => navigate('/merchant-dashboard?tab=availability')}>Availability</TabsTrigger>
              <TabsTrigger value="services" onClick={() => navigate('/merchant-dashboard?tab=services')}>Services</TabsTrigger>
              <TabsTrigger value="settings" onClick={() => navigate('/merchant-dashboard?tab=settings')}>Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <DashboardMetrics metrics={metrics} />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
                  <AppointmentsList 
                    appointments={processedAppointments.slice(0, 5)} 
                    empty="No recent appointments"
                  />
                </div>
                
                <div className="lg:col-span-4">
                  <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
                  {/* Display today's appointments */}
                  <div className="bg-muted/50 rounded-lg p-6">
                    {processedAppointments
                      .filter(app => app.date === new Date().toISOString().split('T')[0])
                      .slice(0, 5)
                      .map((app, i) => (
                        <div 
                          key={app.id} 
                          className={`p-3 rounded-md mb-2 ${
                            i % 2 === 0 ? 'bg-background' : 'bg-muted'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{app.customerName}</p>
                              <p className="text-sm text-muted-foreground">{app.service}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{app.time}</p>
                              <p className="text-sm text-muted-foreground">{app.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {processedAppointments.filter(app => app.date === new Date().toISOString().split('T')[0]).length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No appointments today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appointments">
              <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
              <AppointmentsList 
                appointments={processedAppointments} 
                empty="No appointments found" 
              />
            </TabsContent>
            
            <TabsContent value="availability">
              <h2 className="text-xl font-semibold mb-4">Manage Availability</h2>
              <SlotManager 
                slots={processedSlots}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onRefresh={handleRefresh}
                merchantId={user?.id || ''}
              />
            </TabsContent>
            
            <TabsContent value="services">
              <h2 className="text-xl font-semibold mb-4">Your Services</h2>
              <p>Service management coming soon...</p>
            </TabsContent>
            
            <TabsContent value="settings">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <p>Settings management coming soon...</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchantDashboard;
