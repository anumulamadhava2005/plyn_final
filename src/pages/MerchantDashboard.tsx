
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useMerchantDashboard } from '@/hooks/useMerchantDashboard';

// Import the refactored components
import MerchantHeader from '@/components/merchant/dashboard/MerchantHeader';
import AppointmentTab from '@/components/merchant/dashboard/AppointmentTab';
import AvailabilityTab from '@/components/merchant/dashboard/AvailabilityTab';
import BusinessInfoTab from '@/components/merchant/dashboard/BusinessInfoTab';

const MerchantDashboard = () => {
  const {
    merchantData,
    userProfile,
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
  } = useMerchantDashboard();

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin mb-4 mx-auto h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
              <p>Loading your merchant dashboard...</p>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <MerchantHeader 
              merchantData={merchantData} 
              userProfile={userProfile} 
              slotsCount={slots.length} 
              bookingsCount={bookings.length} 
              refreshData={loadMerchantData} 
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
              <TabsList className="grid grid-cols-1 md:grid-cols-3">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="settings">Business Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="space-y-6">
                <AppointmentTab 
                  bookings={bookings} 
                  handleUpdateBookingStatus={handleUpdateBookingStatus}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              </TabsContent>
              
              <TabsContent value="availability" className="space-y-6">
                <AvailabilityTab 
                  slots={slots}
                  handleCreateSlot={handleCreateSlot}
                  handleNewSlotChange={handleNewSlotChange}
                  newSlot={newSlot}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <BusinessInfoTab merchantData={merchantData} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MerchantDashboard;
