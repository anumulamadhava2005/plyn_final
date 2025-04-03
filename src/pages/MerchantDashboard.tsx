import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
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

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState<string>('dashboard');
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        .select('id, merchant_id')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profile && profile.merchant_id) {
        setMerchantId(profile.merchant_id);

        const { data: merchant, error: merchantError } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', profile.merchant_id)
          .single();

        if (merchantError) {
          throw merchantError;
        }

        setMerchantData(merchant);
      } else {
        // If no merchant ID, redirect to merchant onboarding
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
        .update({ is_active: true })
        .eq('id', merchantId);

      if (error) {
        throw error;
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
        .update({ is_active: false })
        .eq('id', merchantId);

      if (error) {
        throw error;
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

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <MerchantSidebar 
          activeView={selectedView} 
          onViewChange={setSelectedView}
          merchantData={merchantData}
        />
        
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-[80vh]">
              <p>Loading merchant dashboard...</p>
            </div>
          ) : (
            <>
              {selectedView === 'dashboard' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                  <DashboardMetrics merchantId={merchantId!} />
                  
                  <div className="mt-8">
                    <AppointmentsList 
                      merchantId={merchantId!} 
                    />
                  </div>
                </div>
              )}

              {selectedView === 'slots' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Manage Slots</h1>
                  <SlotManager merchantId={merchantId!} />
                </div>
              )}

              {selectedView === 'workers' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Manage Workers</h1>
                  <WorkerManager merchantId={merchantId!} />
                </div>
              )}

              {selectedView === 'services' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Manage Services</h1>
                  <MerchantServices merchantId={merchantId!} />
                </div>
              )}

              {selectedView === 'settings' && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <MerchantSettingsManager merchantId={merchantId!} />
                </div>
              )}

              {merchantData && !merchantData.is_active && (
                <Card className="w-full">
                  <CardContent className="py-4">
                    <p className="text-center text-lg">
                      Your merchant account is not yet active. Please confirm your details to activate your account.
                    </p>
                    <div className="flex justify-center mt-4 space-x-4">
                      <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">
                        Confirm
                      </button>
                      <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">
                        Cancel
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchantDashboard;
