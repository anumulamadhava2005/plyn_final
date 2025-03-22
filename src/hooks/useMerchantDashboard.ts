
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MerchantData, SlotData, BookingData } from '@/types/merchant';

export const useMerchantDashboard = () => {
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

  return {
    user,
    userProfile,
    isMerchant,
    merchantData,
    slots,
    bookings,
    activeTab,
    isLoading,
    newSlot,
    handleNewSlotChange,
    handleCreateSlot,
    handleUpdateBookingStatus,
    formatDate,
    formatTime,
    loadMerchantData,
    setActiveTab,
  };
};
