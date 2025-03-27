
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MerchantApplication, DashboardStats } from '@/types/admin';

export const useAdminDashboard = () => {
  const [pendingApplications, setPendingApplications] = useState<MerchantApplication[]>([]);
  const [approvedApplications, setApprovedApplications] = useState<MerchantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMerchants: 0,
    totalUsers: 0,
    totalBookings: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    totalServices: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();

  const fetchMerchantData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching merchant data...");

      const { data: merchants, error } = await supabase
        .from('merchants')
        .select(`
          *,
          user_profile:profiles(username, email)
        `);

      if (error) {
        console.error("Error fetching merchant data:", error);
        toast({
          title: "Error",
          description: "Failed to load merchant applications.",
          variant: "destructive",
        });
        return;
      }

      console.log("Merchant data fetched:", merchants);

      // Transform data to match the MerchantApplication type
      const transformedData: MerchantApplication[] = merchants.map(merchant => ({
        id: merchant.id,
        business_name: merchant.business_name,
        business_address: merchant.business_address,
        business_email: merchant.business_email,
        business_phone: merchant.business_phone,
        service_category: merchant.service_category,
        status: merchant.status as 'pending' | 'approved' | 'rejected',
        created_at: merchant.created_at,
        user_profile: merchant.user_profile
      }));

      // Filter for pending and approved applications
      const pending = transformedData.filter(m => m.status === 'pending');
      const approved = transformedData.filter(m => m.status === 'approved');
      const rejected = transformedData.filter(m => m.status === 'rejected');

      setPendingApplications(pending);
      setApprovedApplications(approved);

      // Update stats
      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*');

      setStats({
        totalMerchants: approved.length,
        totalUsers: users?.length || 0,
        totalBookings: bookings?.length || 0,
        pendingApplications: pending.length,
        rejectedApplications: rejected.length,
        totalServices: 0, // You may want to update this with real data
        totalRevenue: 0    // You may want to update this with real data
      });

    } catch (error) {
      console.error("Error in fetchMerchantData:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Application Approved",
        description: "The merchant application has been approved.",
      });
      
      fetchMerchantData();
    } catch (error) {
      console.error("Error approving merchant:", error);
      toast({
        title: "Error",
        description: "Failed to approve merchant application.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'rejected' })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Application Rejected",
        description: "The merchant application has been rejected.",
      });
      
      fetchMerchantData();
    } catch (error) {
      console.error("Error rejecting merchant:", error);
      toast({
        title: "Error",
        description: "Failed to reject merchant application.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  return {
    pendingApplications,
    approvedApplications,
    isLoading,
    stats,
    handleApprove,
    handleReject
  };
};
