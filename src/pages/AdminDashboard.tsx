import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { Button } from '@/components/ui/button'; 
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type EmptyRPCParams = Record<string, never>;

interface MerchantData {
  id: string;
  business_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  business_email: string;
  business_phone: string;
  [key: string]: any; // For any additional fields
}

interface DebugInfo {
  method?: string;
  error?: any;
  message?: string;
  data?: any;
  count?: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('applications');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  
  const { toast } = useToast();
  
  const { 
    pendingApplications, 
    approvedApplications,
    fetchApplications,
    handleApprove,
    handleReject,
    isLoading
  } = useAdminDashboard();

  const handleCheckDatabase = async () => {
    try {
      setIsRefreshing(true);
      
      if (!window.confirm("This will execute a database function directly. Continue?")) {
        setIsRefreshing(false);
        return;
      }
      
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*');
        
      if (merchantError) {
        console.error("Error fetching merchant data:", merchantError);
        setDebugInfo({
          method: "Direct Select",
          error: merchantError,
          message: merchantError.message,
        });
        
        toast({
          title: "Database Error",
          description: merchantError.message,
          variant: "destructive",
        });
        setIsRefreshing(false);
        return;
      }
      
      console.log("Merchant Data:", merchantData);
      
      setDebugInfo({
        method: "Direct Select",
        data: merchantData,
        count: merchantData ? merchantData.length : 0
      });
      
      toast({
        title: "Database Check (Direct)",
        description: `Found ${merchantData ? merchantData.length : 0} merchant records using direct select.`,
      });
      return;
    } catch (error) {
      console.error("Unexpected error during database check:", error);
      setDebugInfo({
        method: "Direct Select",
        error: error,
        message: (error as any).message || "An unexpected error occurred.",
      });
      
      toast({
        title: "Unexpected Error",
        description: (error as any).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchMerchantsWithRPC = async () => {
    try {
      setIsChecking(true);
      
      if (!window.confirm("This will execute a database function directly. Continue?")) {
        setIsChecking(false);
        return;
      }
      
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_merchants', {} as EmptyRPCParams);
        
      if (rpcError) {
        console.error("Error fetching merchant data via RPC:", rpcError);
        setDebugInfo({
          method: "RPC",
          error: rpcError,
          message: rpcError.message,
        });
        
        toast({
          title: "RPC Error",
          description: rpcError.message,
          variant: "destructive",
        });
        setIsChecking(false);
        return;
      }
      
      console.log("RPC Result:", rpcData);
      
      setDebugInfo({
        method: "RPC",
        data: rpcData,
        count: rpcData ? (rpcData as any[]).length : 0
      });
      
      toast({
        title: "Database Check (RPC)",
        description: `Found ${rpcData ? (rpcData as any[]).length : 0} merchant records using RPC method.`,
      });
      return;
    } catch (error) {
      console.error("Unexpected error during RPC call:", error);
      setDebugInfo({
        method: "RPC",
        error: error,
        message: (error as any).message || "An unexpected error occurred during the RPC call.",
      });
      
      toast({
        title: "Unexpected RPC Error",
        description: (error as any).message || "An unexpected error occurred during the RPC call.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="container mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage merchant applications and system settings.</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="applications">Merchant Applications</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingApplications.map((app: MerchantData) => (
                  <Card key={app.id} className="bg-white shadow-md rounded-md">
                    <CardHeader>
                      <CardTitle>{app.business_name}</CardTitle>
                      <CardDescription>
                        Submitted on {new Date(app.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Email: {app.business_email}</p>
                      <p>Phone: {app.business_phone}</p>
                      <Badge variant="secondary">Pending</Badge>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button onClick={() => handleApprove(app.id)} variant="ghost">Approve</Button>
                      <Button onClick={() => handleReject(app.id)} variant="destructive">Reject</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {approvedApplications.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold mt-8">Approved Merchants</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedApplications.map((app: MerchantData) => (
                      <Card key={app.id} className="bg-white shadow-md rounded-md">
                        <CardHeader>
                          <CardTitle>{app.business_name}</CardTitle>
                          <CardDescription>
                            Approved on {new Date(app.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Email: {app.business_email}</p>
                          <p>Phone: {app.business_phone}</p>
                          <Badge variant="success">Approved</Badge>
                        </CardContent>
                      </Card>
                    </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="bg-white shadow-md rounded-md p-6">
                <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                <p className="text-muted-foreground">
                  Here you can manage various system settings.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="debug">
              <div className="bg-white shadow-md rounded-md p-6">
                <h2 className="text-xl font-semibold mb-4">Database Debug</h2>
                <p className="text-muted-foreground">
                  Tools for debugging database connections and data retrieval.
                </p>
                
                <div className="mt-4 space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={handleCheckDatabase}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? "Checking..." : "Check Database (Direct)"}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={fetchMerchantsWithRPC}
                    disabled={isChecking}
                  >
                    {isChecking ? "Checking..." : "Check Database (RPC)"}
                  </Button>
                  
                  {debugInfo && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Debug Information</CardTitle>
                        <CardDescription>Details from the last database operation.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p><strong>Method:</strong> {debugInfo.method || 'N/A'}</p>
                        {debugInfo.error && (
                          <>
                            <p><strong>Error:</strong> {debugInfo.error.message || 'N/A'}</p>
                            <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto">
                              {JSON.stringify(debugInfo.error, null, 2)}
                            </pre>
                          </>
                        )}
                        {debugInfo.data && (
                          <>
                            <p><strong>Data Count:</strong> {debugInfo.count || 0}</p>
                            <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto">
                              {JSON.stringify(debugInfo.data, null, 2)}
                            </pre>
                          </>
                        )}
                        {debugInfo.message && (
                          <p><strong>Message:</strong> {debugInfo.message}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
