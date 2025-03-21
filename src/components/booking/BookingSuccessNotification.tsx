
import React from 'react';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/date-utils';

export const showBookingSuccessNotification = (bookingData: any) => {
  // Format the booking data for display
  const formattedDate = formatDate(new Date(bookingData.date));
  const formattedTime = bookingData.timeSlot;

  toast({
    duration: 6000,
    className: "booking-success-toast",
    description: (
      <div className="flex items-start">
        <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-2 mr-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-base">Booking Confirmed!</h3>
          <p className="text-sm mt-1">Your appointment has been successfully booked.</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-xs">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
      </div>
    ),
  });
};

export const showBookingCancelledNotification = (bookingId: string) => {
  toast({
    duration: 4000,
    variant: "destructive",
    description: (
      <div className="flex items-center">
        <div className="mr-3">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Booking Cancelled</p>
          <p className="text-xs mt-1">Your booking has been successfully cancelled.</p>
        </div>
      </div>
    ),
  });
};

export const showReminderNotification = (bookingData: any) => {
  toast({
    duration: 8000,
    description: (
      <div className="flex items-start">
        <div className="bg-primary/10 rounded-full p-2 mr-3">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Upcoming Appointment</h3>
          <p className="text-sm mt-1">
            You have an appointment at {bookingData.salonName} tomorrow.
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{formatDate(new Date(bookingData.date))}</span>
            </div>
            <div className="flex items-center text-xs">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{bookingData.timeSlot}</span>
            </div>
          </div>
        </div>
      </div>
    ),
  });
};
