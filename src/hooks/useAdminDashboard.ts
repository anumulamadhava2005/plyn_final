
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Define types
type UserProfile = {
  username: string | null;
  email: string | null;
};

type MerchantApplication = {
  id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_profile: UserProfile | null;
};

type DashboardStats = {
  totalMerchants: number;
  totalUsers: number;
  totalBookings: number;
  pendingApplications: number;
};

export const useAdminDashboard = () => {
  const [pendingApplications, setPendingApplications] = useState<MerchantApplication[]>([]);
  const [approvedMerchants, setApprovedMerchants] = useState<MerchantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    totalUsers: 0,
    totalBookings: 0,
    pendingApplications: 0
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin
  const checkAdminStatus = () => {
    const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const adminEmail = sessionStorage.getItem('adminEmail');
    
    if (!isAdminLoggedIn || adminEmail !== 'srimanmudavath@gmail.com') {
      window.location.href = '/admin-login';
      return false;
    }
    
    return true;
  };

  // Fetch merchant applications
  const fetchMerchantApplications = async () => {
    try {
      setIsLoading(true);
      
      // Fetch pending merchant applications
      const { data: pendingData, error: pendingError } = await supabase
        .from('merchants')
        .select(`
          id,
          business_name,
          business_address,
          business_email,
          business_phone,
          service_category,
          created_at,
          updated_at,
          status,
          user_profile:profiles(username, email)
        `)
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Fetch approved merchants
      const { data: approvedData, error: approvedError } = await supabase
        .from('merchants')
        .select(`
          id,
          business_name,
          business_address,
          business_email,
          business_phone,
          service_category,
          created_at,
          updated_at,
          status,
          user_profile:profiles(username, email)
        `)
        .eq('status', 'approved');
      
      if (approvedError) throw approvedError;
      
      // Process and handle possible null user profiles with proper type checking
      const pendingApplicationsTyped: MerchantApplication[] = pendingData ? pendingData.map(item => {
        // Check if user_profile exists and is not a string
        let processedUserProfile: UserProfile | null = null;
        
        if (item.user_profile && typeof item.user_profile === 'object') {
          const profile = item.user_profile as Record<string, any>;
          processedUserProfile = {
            username: profile.username || null,
            email: profile.email || null
          };
        }
        
        return {
          id: item.id,
          business_name: item.business_name,
          business_address: item.business_address,
          business_email: item.business_email,
          business_phone: item.business_phone,
          service_category: item.service_category,
          status: 'pending',
          created_at: item.created_at,
          user_profile: processedUserProfile
        };
      }) : [];
      
      const approvedMerchantsTyped: MerchantApplication[] = approvedData ? approvedData.map(item => {
        // Check if user_profile exists and is not a string
        let processedUserProfile: UserProfile | null = null;
        
        if (item.user_profile && typeof item.user_profile === 'object') {
          const profile = item.user_profile as Record<string, any>;
          processedUserProfile = {
            username: profile.username || null,
            email: profile.email || null
          };
        }
        
        return {
          id: item.id,
          business_name: item.business_name,
          business_address: item.business_address,
          business_email: item.business_email,
          business_phone: item.business_phone,
          service_category: item.service_category,
          status: 'approved',
          created_at: item.created_at,
          user_profile: processedUserProfile
        };
      }) : [];
      
      setPendingApplications(pendingApplicationsTyped);
      setApprovedMerchants(approvedMerchantsTyped);
      
      // Fetch dashboard stats
      const { data: merchantCount } = await supabase
        .from('merchants')
        .select('id', { count: 'exact' })
        .eq('status', 'approved');
      
      const { data: userCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      const { data: bookingCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' });
      
      setStats({
        totalMerchants: merchantCount?.length || 0,
        totalUsers: userCount?.length || 0,
        totalBookings: bookingCount?.length || 0,
        pendingApplications: pendingApplicationsTyped.length
      });
      
    } catch (error) {
      console.error('Error fetching merchant applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch merchant applications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle merchant application approval
  const handleApprove = async (merchantId: string) => {
    try {
      // Update the merchant status in the database
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'approved' })
        .eq('id', merchantId);
      
      if (error) throw error;
      
      // Find the merchant data from our local state
      const merchantToApprove = pendingApplications.find(app => app.id === merchantId);
      
      if (merchantToApprove?.user_profile?.username) {
        // Update profiles table using username for lookup
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_merchant: true })
          .eq('username', merchantToApprove.user_profile.username);
          
        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }
      
      // Update local state
      setPendingApplications(prev => prev.filter(app => app.id !== merchantId));
      
      toast({
        title: "Merchant Approved",
        description: "The merchant application has been approved successfully.",
      });
      
      // Refresh merchant applications
      fetchMerchantApplications();
      
    } catch (error) {
      console.error('Error approving merchant:', error);
      toast({
        title: "Error",
        description: "Failed to approve merchant application.",
        variant: "destructive",
      });
    }
  };

  // Handle merchant application rejection
  const handleReject = async (merchantId: string) => {
    try {
      // Update the merchant status in the database
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'rejected' })
        .eq('id', merchantId);
      
      if (error) throw error;
      
      // Update local state
      setPendingApplications(prev => prev.filter(app => app.id !== merchantId));
      
      toast({
        title: "Merchant Rejected",
        description: "The merchant application has been rejected.",
      });
      
    } catch (error) {
      console.error('Error rejecting merchant:', error);
      toast({
        title: "Error",
        description: "Failed to reject merchant application.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (checkAdminStatus()) {
      fetchMerchantApplications();
    }
  }, []);

  return {
    pendingApplications,
    approvedMerchants,
    isLoading,
    stats,
    handleApprove,
    handleReject
  };
};
