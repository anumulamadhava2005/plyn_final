
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AppointmentsListProps {
  merchantId: string;
}

type Booking = {
  id: string;
  created_at: string;
  salon_name: string;
  booking_date: string;
  time_slot: string;
  service_name: string;
  service_price: number;
  status: string;
  customer_email: string;
  customer_phone: string;
  additional_notes?: string;
  user_id?: string;
  customer_name?: string;
};

const AppointmentsList: React.FC<AppointmentsListProps> = ({ merchantId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (merchantId) {
      fetchBookings();
    }
  }, [merchantId, filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id, 
          created_at, 
          salon_name, 
          booking_date, 
          time_slot, 
          service_name, 
          service_price, 
          status, 
          customer_email, 
          customer_phone, 
          additional_notes,
          user_id
        `)
        .eq('merchant_id', merchantId)
        .order('booking_date', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        // Fetch user names (optional)
        const bookingsWithUserInfo = await Promise.all(
          data.map(async (booking) => {
            if (booking.user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', booking.user_id)
                .single();

              return {
                ...booking,
                customer_name: userData?.username || 'Anonymous'
              };
            }
            return booking;
          })
        );

        setBookings(bookingsWithUserInfo);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      toast({
        title: "Status Updated",
        description: `Booking has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

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
    <div className="rounded-md border">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No bookings found.
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your appointments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.booking_date ? format(new Date(booking.booking_date), 'dd MMM yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{booking.time_slot || 'N/A'}</TableCell>
                <TableCell>
                  <div>
                    <span>{booking.service_name}</span>
                    <div className="text-sm text-muted-foreground">
                      ${booking.service_price}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span>{booking.customer_name || 'Customer'}</span>
                    <div className="text-xs text-muted-foreground">
                      {booking.customer_email}
                    </div>
                    {booking.customer_phone && (
                      <div className="text-xs text-muted-foreground">
                        {booking.customer_phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell className="text-right">
                  {booking.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                      >
                        Complete
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AppointmentsList;
