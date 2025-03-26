
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MerchantApplication, DashboardStats } from '@/types/admin';

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
      console.log("Not admin - redirecting to login");
      window.location.href = '/admin-login';
      return false;
    }
    
    return true;
  };

  // Fetch merchant applications
  const fetchMerchantApplications = async () => {
    try {
      console.log("Fetching merchant applications");
      setIsLoading(true);
      
      // Fetch pending merchant applications
      console.log("Fetching pending applications");
      const { data: pendingData, error: pendingError } = await supabase
        .from('merchants')
        .select('*')
        .eq('status', 'pending');
      
      if (pendingError) {
        console.error("Error fetching pending merchants:", pendingError);
        throw pendingError;
      }
      
      console.log("Pending merchants data:", pendingData);
      
      // Fetch approved merchants
      console.log("Fetching approved merchants");
      const { data: approvedData, error: approvedError } = await supabase
        .from('merchants')
        .select('*')
        .eq('status', 'approved');
      
      if (approvedError) {
        console.error("Error fetching approved merchants:", approvedError);
        throw approvedError;
      }
      
      console.log("Approved merchants data:", approvedData);
      
      // Process pending applications
      const enhancedPendingApplications: MerchantApplication[] = [];
      
      for (const merchant of pendingData || []) {
        console.log("Processing pending merchant:", merchant.id);
        try {
          // Get the user profile associated with this merchant
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', merchant.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching profile for merchant:", profileError);
            continue;
          }
          
          console.log("Profile data for merchant:", profileData);
          
          enhancedPendingApplications.push({
            id: merchant.id,
            business_name: merchant.business_name,
            business_address: merchant.business_address,
            business_email: merchant.business_email,
            business_phone: merchant.business_phone,
            service_category: merchant.service_category,
            status: 'pending',
            created_at: merchant.created_at,
            user_profile: {
              username: profileData?.username || 'Unknown',
              email: merchant.business_email // Use business_email from merchant record
            }
          });
        } catch (err) {
          console.error("Error processing merchant:", merchant.id, err);
        }
      }
      
      console.log("Enhanced pending applications:", enhancedPendingApplications);
      
      // Process approved merchants
      const enhancedApprovedMerchants: MerchantApplication[] = [];
      
      for (const merchant of approvedData || []) {
        try {
          // Get the user profile associated with this merchant
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', merchant.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error fetching profile for approved merchant:", profileError);
            continue;
          }
          
          enhancedApprovedMerchants.push({
            id: merchant.id,
            business_name: merchant.business_name,
            business_address: merchant.business_address,
            business_email: merchant.business_email,
            business_phone: merchant.business_phone,
            service_category: merchant.service_category,
            status: 'approved',
            created_at: merchant.created_at,
            user_profile: {
              username: profileData?.username || 'Unknown',
              email: merchant.business_email // Use business_email from merchant record
            }
          });
        } catch (err) {
          console.error("Error processing approved merchant:", merchant.id, err);
        }
      }
      
      setPendingApplications(enhancedPendingApplications);
      setApprovedMerchants(enhancedApprovedMerchants);
      
      // Fetch dashboard stats
      const { count: merchantCount, error: merchantCountError } = await supabase
        .from('merchants')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved');
      
      const { count: userCount, error: userCountError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      const { count: bookingCount, error: bookingCountError } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true });
      
      setStats({
        totalMerchants: merchantCount || 0,
        totalUsers: userCount || 0,
        totalBookings: bookingCount || 0,
        pendingApplications: enhancedPendingApplications.length
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
      console.log("Approving merchant:", merchantId);
      // Update the merchant status in the database
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'approved' })
        .eq('id', merchantId);
      
      if (error) {
        console.error("Error approving merchant:", error);
        throw error;
      }
      
      // Update profiles table to set is_merchant to true
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_merchant: true })
        .eq('id', merchantId);
          
      if (profileError) {
        console.error('Error updating profile:', profileError);
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
      console.log("Rejecting merchant:", merchantId);
      // Update the merchant status in the database
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'rejected' })
        .eq('id', merchantId);
      
      if (error) {
        console.error("Error rejecting merchant:", error);
        throw error;
      }
      
      // Update local state
      setPendingApplications(prev => prev.filter(app => app.id !== merchantId));
      
      toast({
        title: "Merchant Rejected",
        description: "The merchant application has been rejected.",
      });
      
      // Refresh data
      fetchMerchantApplications();
      
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
    console.log("useAdminDashboard hook mounted");
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
