
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/transitions/PageTransition';
import DashboardStats from '@/components/admin/DashboardStats';
import MerchantApplicationList from '@/components/admin/MerchantApplicationList';
import ApprovedMerchantsList from '@/components/admin/ApprovedMerchantsList';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { Button } from '@/components/ui/button'; 
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    pendingApplications, 
    approvedMerchants, 
    isLoading, 
    stats, 
    handleApprove, 
    handleReject 
  } = useAdminDashboard();

  console.log("Admin Dashboard - Pending Applications:", pendingApplications);
  console.log("Admin Dashboard - Is Loading:", isLoading);

  // More strict check for admin authentication
  useEffect(() => {
    console.log("Checking admin authentication");
    const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const adminEmail = sessionStorage.getItem('adminEmail');
    
    console.log("Admin auth check:", { isAdminLoggedIn, adminEmail });
    
    if (!isAdminLoggedIn || adminEmail !== 'srimanmudavath@gmail.com') {
      // Redirect to admin login page if not logged in
      console.log("Not admin, redirecting to login");
      window.location.href = '/admin-login';
    }
  }, []);

  // Debug function to view raw database data
  const checkRawData = async () => {
    try {
      const { data: merchants, error } = await supabase
        .from('merchants')
        .select('*');
        
      if (error) {
        console.error("Error fetching raw merchant data:", error);
        toast({
          title: "Error",
          description: "Could not fetch raw database data",
          variant: "destructive"
        });
        return;
      }
      
      console.log("RAW Merchants Data:", merchants);
      toast({
        title: "Database Check",
        description: `Found ${merchants?.length || 0} merchant records in database.`,
      });
      
    } catch (e) {
      console.error("Exception during raw data check:", e);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <AdminNavbar />
        
        <main className="flex-grow pt-20 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-6 w-6 text-red-500" />
                  <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
                </div>
                <p className="text-muted-foreground">
                  Manage merchant applications, users, and platform settings
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-red-500">Admin Portal</Badge>
                <Button variant="outline" size="sm" onClick={checkRawData}>
                  Check Database
                </Button>
              </div>
            </div>
            
            {/* Dashboard Stats */}
            <DashboardStats 
              totalMerchants={stats.totalMerchants}
              totalUsers={stats.totalUsers}
              totalBookings={stats.totalBookings}
              pendingApplications={stats.pendingApplications}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="applications">Merchant Applications</TabsTrigger>
                <TabsTrigger value="merchants">Approved Merchants</TabsTrigger>
                <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="applications" className="space-y-6">
                <MerchantApplicationList 
                  applications={pendingApplications}
                  isLoading={isLoading}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </TabsContent>
              
              <TabsContent value="merchants" className="space-y-6">
                <ApprovedMerchantsList 
                  merchants={approvedMerchants}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
