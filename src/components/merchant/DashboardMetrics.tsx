
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, Clock, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetricsProps {
  totalAppointments?: number;
  todayAppointments?: number;
  totalClients?: number;
  availableSlots?: number;
  merchantId?: string;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalAppointments: initialTotalAppointments,
  todayAppointments: initialTodayAppointments,
  totalClients: initialTotalClients,
  availableSlots: initialAvailableSlots,
  merchantId
}) => {
  const [metrics, setMetrics] = useState({
    totalAppointments: initialTotalAppointments || 0,
    todayAppointments: initialTodayAppointments || 0,
    totalClients: initialTotalClients || 0,
    availableSlots: initialAvailableSlots || 0,
  });

  useEffect(() => {
    if (merchantId) {
      fetchMetrics();
    }
  }, [merchantId]);

  const fetchMetrics = async () => {
    if (!merchantId) return;
    
    try {
      // Get today's date in format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch total appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('merchant_id', merchantId);
      
      // Fetch today's appointments
      const { data: todayAppointmentsData, error: todayAppointmentsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('merchant_id', merchantId)
        .eq('booking_date', today);
      
      // Fetch unique clients - using select instead of distinct
      const { data: clientsData, error: clientsError } = await supabase
        .from('bookings')
        .select('user_id')
        .eq('merchant_id', merchantId);
      
      // Count unique user_ids
      const uniqueUserIds = new Set();
      clientsData?.forEach(booking => {
        if (booking.user_id) {
          uniqueUserIds.add(booking.user_id);
        }
      });
      
      // Fetch available slots
      const { data: availableSlotsData, error: availableSlotsError } = await supabase
        .from('slots')
        .select('id')
        .eq('merchant_id', merchantId)
        .eq('is_booked', false)
        .gte('date', today);
      
      setMetrics({
        totalAppointments: appointmentsData?.length || 0,
        todayAppointments: todayAppointmentsData?.length || 0,
        totalClients: uniqueUserIds.size,
        availableSlots: availableSlotsData?.length || 0,
      });
      
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm">Total Appointments</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.totalAppointments}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm">Today's Appointments</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.todayAppointments}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm">Total Clients</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.totalClients}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm">Available Slots</p>
              <h3 className="text-3xl font-bold mt-1">{metrics.availableSlots}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
