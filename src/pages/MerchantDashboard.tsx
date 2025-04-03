import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardMetrics from '@/components/merchant/DashboardMetrics';
import SlotManager from '@/components/merchant/SlotManager';
import WorkerManager from '@/components/merchant/WorkerManager';
import MerchantSettingsManager from '@/components/merchant/MerchantSettingsManager';
import MerchantServices from '@/components/merchant/MerchantServices';
import AppointmentsList from '@/components/merchant/AppointmentsList';
import PageTransition from '@/components/transitions/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkerSchedule from '@/components/merchant/WorkerSchedule';

interface MerchantData {
  id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
  status: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchMerchantData();
    }
  }, [user, navigate]);

  const fetchMerchantData = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profile && profile.is_merchant) {
        setMerchantId(user?.id || null);

        const { data: merchant, error: merchantError } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (merchantError) {
          throw merchantError;
        }

        setMerchantData({
          ...merchant,
          is_active: merchant.status === 'approved'
        });
      } else {
        navigate('/merchant-onboarding');
      }
    } catch (error: any) {
      console.error("Error fetching merchant data:", error);
      toast({
        title: "Error",
        description: "Failed to load merchant data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'approved' })
        .eq('id', merchantId);

      if (error) {
        throw error;
      }

      if (merchantData) {
        setMerchantData({
          ...merchantData,
          status: 'approved',
          is_active: true
        });
      }

      toast({
        title: "Success",
        description: "Merchant account confirmed!",
      });
    } catch (error: any) {
      console.error("Error confirming merchant:", error);
      toast({
        title: "Error",
        description: "Failed to confirm merchant account",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('merchants')
        .update({ status: 'inactive' })
        .eq('id', merchantId);

      if (error) {
        throw error;
      }

      if (merchantData) {
        setMerchantData({
          ...merchantData,
          status: 'inactive',
          is_active: false
        });
      }

      toast({
        title: "Account Deactivated",
        description: "Merchant account deactivated.",
      });
    } catch (error: any) {
      console.error("Error cancelling merchant:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate merchant account",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Return to Site
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Merchant Dashboard</h1>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-[80vh]">
              <p>Loading merchant dashboard...</p>
            </div>
          ) : (
            <>
              {merchantData && merchantData.status !== 'approved' && (
                <Card className="w-full mb-6">
                  <CardContent className="py-4">
                    <p className="text-center text-lg">
                      Your merchant account is not yet active. Please confirm your details to activate your account.
                    </p>
                    <div className="flex justify-center mt-4 space-x-4">
                      <Button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
                        Confirm
                      </Button>
                      <Button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {merchantId && (
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="slots">Time Slots</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="workers">Workers</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="pt-6">
                    <div className="space-y-6">
                      <DashboardMetrics merchantId={merchantId} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="appointments" className="pt-6">
                    <div className="space-y-6">
                      <AppointmentsList merchantId={merchantId} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="slots" className="pt-6">
                    <div className="space-y-6">
                      <SlotManager merchantId={merchantId} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="pt-6">
                    <div className="space-y-6">
                      <MerchantServices merchantId={merchantId} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="workers" className="pt-6">
                    <div className="space-y-6">
                      <WorkerSchedule merchantId={merchantId} />
                      <WorkerManager merchantId={merchantId} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="pt-6">
                    <div className="space-y-6">
                      <MerchantSettingsManager merchantId={merchantId} />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchantDashboard;
