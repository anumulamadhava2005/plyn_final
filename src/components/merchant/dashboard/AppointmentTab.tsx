
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, CalendarDays, Users, Scissors, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { BookingData } from '@/types/merchant';

interface AppointmentTabProps {
  bookings: BookingData[];
  handleUpdateBookingStatus: (bookingId: string, newStatus: string) => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
}

const AppointmentTab: React.FC<AppointmentTabProps> = ({
  bookings,
  handleUpdateBookingStatus,
  formatDate,
  formatTime
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          Manage your scheduled appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No Appointments Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You don't have any bookings yet. Make sure you've added availability slots for customers to book.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className={`h-1.5 w-full 
                  ${booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'pending' ? 'bg-yellow-500' : 
                    'bg-red-500'}`}
                />
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Customer</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{booking.user_profile?.username || 'Customer'}</p>
                          <p className="text-xs text-muted-foreground">{booking.user_profile?.phoneNumber || 'No phone'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Date & Time</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {booking.slot?.date ? formatDate(booking.slot.date) : 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.slot?.start_time ? 
                              `${formatTime(booking.slot.start_time)} - ${formatTime(booking.slot.end_time)}` : 
                              'Time not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Service & Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Scissors className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{booking.service_name || 'Service'}</p>
                          <div className="mt-1">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 md:text-right flex md:block gap-2">
                      <p className="text-sm font-medium md:mb-2">Actions</p>
                      <div className="flex gap-2 flex-wrap">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" 
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {booking.status === 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentTab;
