
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

export interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'cancelled' | 'pending' | 'missed';
  worker?: string;
}

interface AppointmentsListProps {
  merchantId: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ merchantId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Filter appointments for display
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return appointment.status === 'confirmed' || appointment.status === 'pending';
    if (filter === 'past') return appointment.status === 'missed';
    if (filter === 'cancelled') return appointment.status === 'cancelled';
    return true;
  });

  const refreshAppointments = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Get all bookings for this merchant
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            profiles:user_profile_id (username),
            workers:worker_id (name)
          `)
          .eq('merchant_id', merchantId)
          .order('booking_date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const mappedAppointments: Appointment[] = data.map(booking => ({
            id: booking.id,
            customerName: booking.customer_email || (booking.profiles?.username || 'Guest'),
            service: booking.service_name,
            date: booking.booking_date || 'No date',
            time: booking.time_slot || 'No time',
            duration: booking.service_duration ? `${booking.service_duration} min` : '30 min',
            status: booking.status as 'confirmed' | 'cancelled' | 'pending' | 'missed',
            worker: booking.workers?.name || 'Not Assigned'
          }));
          
          setAppointments(mappedAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [merchantId, refreshKey, toast]);

  const handleStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled' | 'pending' | 'missed') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      // If cancelling, we need to release the slot
      if (newStatus === 'cancelled') {
        // Get the booking to find the slot_id
        const { data: booking, error: fetchError } = await supabase
          .from('bookings')
          .select('slot_id')
          .eq('id', appointmentId)
          .single();
          
        if (fetchError) throw fetchError;
        
        if (booking && booking.slot_id) {
          // Update the slot to make it available again
          const { error: slotError } = await supabase
            .from('slots')
            .update({ is_booked: false })
            .eq('id', booking.slot_id);
            
          if (slotError) throw slotError;
        }
      }
      
      // Update the local state
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
      
      toast({
        title: "Success",
        description: `Appointment ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshAppointments}>Refresh</Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No appointments {filter !== 'all' ? 'in this category' : ''} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-5 relative">
              <div className="absolute top-4 right-4">
                {appointment.status === 'confirmed' && (
                  <Badge variant="success" className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmed
                  </Badge>
                )}
                {appointment.status === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Pending
                  </Badge>
                )}
                {appointment.status === 'cancelled' && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Cancelled
                  </Badge>
                )}
                {appointment.status === 'missed' && (
                  <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Missed
                  </Badge>
                )}
              </div>
              
              <div className="mt-6">
                <p className="font-semibold text-lg">{appointment.customerName}</p>
                <p className="text-md text-muted-foreground">{appointment.service}</p>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="text-sm font-medium">Date: <span className="font-normal">{appointment.date}</span></p>
                    <p className="text-sm font-medium">Time: <span className="font-normal">{appointment.time}</span></p>
                    <p className="text-sm font-medium">Duration: <span className="font-normal">{appointment.duration}</span></p>
                    {appointment.worker && (
                      <p className="text-sm font-medium">Worker: <span className="font-normal">{appointment.worker}</span></p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {appointment.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="w-full"
                      >
                        Confirm
                      </Button>
                    )}
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <Button 
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
