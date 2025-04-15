
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Check, Calendar, Clock } from 'lucide-react';

interface BookingDetails {
  salonName?: string;
  serviceName?: string;
  date?: string;
  time?: string;
  timeSlot?: string; // Alternative field name
  services?: { name: string; price: number }[];
  totalPrice?: number;
}

export const showBookingSuccessNotification = (booking: BookingDetails) => {
  toast({
    title: "Booking Confirmed!",
    description: (
      <div className="flex flex-col gap-1">
        <p className="mb-1">Your appointment has been successfully booked!</p>
        <div className="flex items-start gap-2 mt-1">
          <Calendar className="h-4 w-4 mt-1 text-primary" />
          <span>{booking.date || 'Date scheduled'}</span>
        </div>
        <div className="flex items-start gap-2 mt-1">
          <Clock className="h-4 w-4 mt-1 text-primary" />
          <span>{booking.time || booking.timeSlot || 'Time scheduled'}</span>
        </div>
        <p className="font-medium mt-1">{booking.salonName || 'Salon'}</p>
        
        {booking.services && booking.services.length > 0 ? (
          <div className="mt-1 pt-1 border-t">
            {booking.services.map((service, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{service.name}</span>
                <span>₹{service.price}</span>
              </div>
            ))}
            {booking.totalPrice && (
              <div className="flex justify-between font-medium text-sm mt-1 pt-1 border-t">
                <span>Total:</span>
                <span>₹{booking.totalPrice}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{booking.serviceName || 'Service booked'}</p>
        )}
      </div>
    ),
    variant: "default"
  });
};
