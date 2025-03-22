
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Store, 
  Users,
  Scissors,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type MerchantApplication = {
  id: string;
  user_id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_profile?: {
    username: string;
    email: string;
  }
};

const AdminDashboard = () => {
  const [pendingApplications, setPendingApplications] = useState<MerchantApplication[]>([]);
  const [approvedMerchants, setApprovedMerchants] = useState<MerchantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('applications');
  const [stats, setStats] = useState({
    totalMerchants: 0,
    totalUsers: 0,
    totalBookings: 0,
    pendingApplications: 0
  });

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/auth');
      return false;
    }

    // In a real application, you would check admin status from a database table
    // For this example, we'll hardcode a check for a specific admin user
    const isAdmin = user.email === 'admin@plyn.com';
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate('/');
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
          *,
          user_profile:profiles(username, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (pendingError) throw pendingError;
      
      // Fetch approved merchants
      const { data: approvedData, error: approvedError } = await supabase
        .from('merchants')
        .select(`
          *,
          user_profile:profiles(username, email)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (approvedError) throw approvedError;
      
      setPendingApplications(pendingData || []);
      setApprovedMerchants(approvedData || []);
      
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
        pendingApplications: pendingData?.length || 0
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
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'approved' })
        .eq('id', merchantId);
      
      if (error) throw error;
      
      // Update profiles table to set is_merchant to true
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('user_id')
        .eq('id', merchantId)
        .single();
      
      if (merchantData) {
        await supabase
          .from('profiles')
          .update({ is_merchant: true })
          .eq('id', merchantData.user_id);
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
    const init = async () => {
      const isAdmin = await checkAdminStatus();
      if (isAdmin) {
        fetchMerchantApplications();
      }
    };
    
    init();
  }, [user]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-12 px-4">
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
              
              <Badge className="bg-red-500">Admin Portal</Badge>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Merchants</p>
                      <p className="text-2xl font-bold">{stats.totalMerchants}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Pending Applications</p>
                      <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <Scissors className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="applications">Merchant Applications</TabsTrigger>
                <TabsTrigger value="merchants">Approved Merchants</TabsTrigger>
                <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="applications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Merchant Applications</CardTitle>
                    <CardDescription>
                      Review and manage merchant applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
                        <p>Loading applications...</p>
                      </div>
                    ) : pendingApplications.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Pending Applications</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          There are no merchant applications waiting for approval at the moment.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingApplications.map(application => (
                          <Card key={application.id} className="overflow-hidden">
                            <div className="h-1.5 w-full bg-orange-500"></div>
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold">{application.business_name}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Owner: {application.user_profile?.username || 'Unknown'}
                                  </p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
                                    <div>
                                      <span className="block text-muted-foreground">Email</span>
                                      <span>{application.business_email}</span>
                                    </div>
                                    <div>
                                      <span className="block text-muted-foreground">Phone</span>
                                      <span>{application.business_phone}</span>
                                    </div>
                                    <div>
                                      <span className="block text-muted-foreground">Address</span>
                                      <span>{application.business_address}</span>
                                    </div>
                                    <div>
                                      <span className="block text-muted-foreground">Service Category</span>
                                      <span className="capitalize">{application.service_category} Salon</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4">
                                    <span className="block text-muted-foreground text-sm">Application Date</span>
                                    <span className="text-sm">
                                      {new Date(application.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 md:min-w-32">
                                  <Button
                                    onClick={() => handleApprove(application.id)}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                    onClick={() => handleReject(application.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
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
              
              <TabsContent value="merchants" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approved Merchants</CardTitle>
                    <CardDescription>
                      Manage approved merchant accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
                        <p>Loading merchants...</p>
                      </div>
                    ) : approvedMerchants.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Approved Merchants</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          There are no approved merchants on the platform yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approvedMerchants.map(merchant => (
                          <Card key={merchant.id} className="overflow-hidden">
                            <div className="h-1.5 w-full bg-green-500"></div>
                            <CardContent className="p-4">
                              <h3 className="text-lg font-semibold">{merchant.business_name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Owner: {merchant.user_profile?.username || 'Unknown'}
                              </p>
                              
                              <div className="grid grid-cols-1 gap-1 mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span>{merchant.business_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Phone:</span>
                                  <span>{merchant.business_phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Type:</span>
                                  <span className="capitalize">{merchant.service_category} Salon</span>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>
                      Overview of platform performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                      <div className="text-center py-16 px-8">
                        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">Analytics Dashboard</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                          Comprehensive analytics feature coming soon.
                        </p>
                        <Button variant="outline" disabled>Coming Soon</Button>
                      </div>
                    </div>
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

export default AdminDashboard;
