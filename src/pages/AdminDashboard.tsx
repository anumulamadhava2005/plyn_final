
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, RefreshCw } from 'lucide-react';
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  useEffect(() => {
    console.log("Checking admin authentication");
    const isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const adminEmail = sessionStorage.getItem('adminEmail');
    
    console.log("Admin auth check:", { isAdminLoggedIn, adminEmail });
    
    if (!isAdminLoggedIn || adminEmail !== 'srimanmudavath@gmail.com') {
      console.log("Not admin, redirecting to login");
      window.location.href = '/admin-login';
    }
  }, []);

  const refreshDashboard = () => {
    setIsRefreshing(true);
    
    window.location.reload();
  };

  const checkRawData = async () => {
    try {
      setDebugInfo(null);
      
      const { data: merchants, error } = await supabase
        .from('merchants')
        .select('*');
        
      if (error) {
        console.error("Error fetching raw merchant data:", error);
        toast({
          title: "Error",
          description: "Could not fetch database data directly",
          variant: "destructive"
        });
        
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_all_merchants', {} as Record<string, any>); // Use Record<string, any> for proper typing
          
        if (rpcError) {
          console.error("Error fetching merchant data via RPC:", rpcError);
          toast({
            title: "Error",
            description: "Could not fetch database data via RPC either",
            variant: "destructive"
          });
          return;
        }
        
        console.log("RAW Merchants Data (via RPC):", rpcData);
        setDebugInfo({
          method: "RPC",
          data: rpcData,
          count: rpcData ? (rpcData as any[]).length : 0 // Use type assertion for null check and length
        });
        
        toast({
          title: "Database Check (RPC)",
          description: `Found ${rpcData ? (rpcData as any[]).length : 0} merchant records using RPC method.`,
        });
        return;
      }
      
      console.log("RAW Merchants Data (direct):", merchants);
      setDebugInfo({
        method: "Direct Query",
        data: merchants,
        count: merchants?.length || 0
      });
      
      toast({
        title: "Database Check",
        description: `Found ${merchants?.length || 0} merchant records in database.`,
      });
      
    } catch (e) {
      console.error("Exception during raw data check:", e);
      toast({
        title: "Error",
        description: "Exception occurred during database check",
        variant: "destructive"
      });
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
            </div>
            
            {debugInfo && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                <p>Method: {debugInfo.method}</p>
                <p>Records found: {debugInfo.count}</p>
                <div className="mt-2">
                  <details>
                    <summary className="cursor-pointer text-blue-500">View raw data</summary>
                    <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(debugInfo.data, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
            
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
