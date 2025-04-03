
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';

interface WorkerScheduleProps {
  merchantId: string;
}

interface Worker {
  id: string;
  name: string;
  specialty?: string;
}

interface Appointment {
  id: string;
  booking_date: string;
  time_slot: string;
  end_time: string;
  service_name: string;
  service_duration: number;
  customer_name: string;
  status: string;
}

const WorkerSchedule: React.FC<WorkerScheduleProps> = ({ merchantId }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Record<string, Appointment[]>>({});
  const [activeWorker, setActiveWorker] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();
  
  // Fetch workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('id, name, specialty')
          .eq('merchant_id', merchantId)
          .eq('is_active', true);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setWorkers(data);
          setActiveWorker(data[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching workers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workers',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkers();
  }, [merchantId, toast]);
  
  // Fetch worker appointments when active worker or date changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!activeWorker) return;
      
      try {
        setLoading(true);
        
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Fetch booked slots (appointments) for this worker and date
        const { data: bookedSlots, error: bookedSlotsError } = await supabase
          .from('slots')
          .select(`
            id,
            date,
            start_time,
            end_time,
            service_name,
            service_duration
          `)
          .eq('worker_id', activeWorker)
          .eq('date', formattedDate)
          .eq('is_booked', true);
          
        if (bookedSlotsError) throw bookedSlotsError;
        
        // Get booking info for more details
        const appointmentsData: Appointment[] = [];
        
        if (bookedSlots && bookedSlots.length > 0) {
          for (const slot of bookedSlots) {
            // Find associated booking for this slot
            const { data: bookingData, error: bookingError } = await supabase
              .from('bookings')
              .select('id, customer_name, customer_email, status')
              .eq('slot_id', slot.id)
              .maybeSingle();
              
            if (bookingError) {
              console.error('Error fetching booking:', bookingError);
              continue;
            }
            
            let customerName = 'Customer';
            if (bookingData?.customer_name) {
              customerName = bookingData.customer_name;
            } else if (bookingData?.customer_email) {
              customerName = bookingData.customer_email.split('@')[0];
            }
            
            appointmentsData.push({
              id: slot.id,
              booking_date: slot.date,
              time_slot: slot.start_time,
              end_time: slot.end_time,
              service_name: slot.service_name || 'Service',
              service_duration: slot.service_duration || 30,
              customer_name: customerName,
              status: bookingData?.status || 'confirmed'
            });
          }
        }
        
        // Group appointments by worker ID
        setAppointments(prev => ({
          ...prev,
          [activeWorker]: appointmentsData
        }));
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointments',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [activeWorker, date, toast]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  return (
    <Card className="bg-black/80 border-border/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Worker Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Date Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(date, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Worker Selector */}
          {workers.length > 0 && (
            <Tabs value={activeWorker || ''} onValueChange={setActiveWorker} className="w-full">
              <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 w-full">
                {workers.map((worker) => (
                  <TabsTrigger key={worker.id} value={worker.id}>
                    {worker.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {workers.map((worker) => (
                <TabsContent key={worker.id} value={worker.id} className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        {worker.name}'s Schedule
                        {worker.specialty && (
                          <span className="text-sm text-muted-foreground ml-2">({worker.specialty})</span>
                        )}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {format(date, 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-8">Loading schedule...</div>
                    ) : appointments[worker.id]?.length ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments[worker.id]?.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {appointment.time_slot} - {appointment.end_time}
                                </div>
                              </TableCell>
                              <TableCell>{appointment.service_duration} mins</TableCell>
                              <TableCell>{appointment.service_name}</TableCell>
                              <TableCell>{appointment.customer_name}</TableCell>
                              <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No appointments scheduled for {worker.name} on this day.
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {workers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No workers found. Add workers to view their schedules.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkerSchedule;
