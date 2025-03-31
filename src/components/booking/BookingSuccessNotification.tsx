
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Check, Calendar, Clock } from 'lucide-react';

interface BookingDetails {
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  services?: { name: string; price: number }[];
  totalPrice?: number;
}

export const showBookingSuccessNotification = (booking: BookingDetails) => {
  toast({
    title: "Booking Confirmed!",
    description: (
      <div className="flex flex-col gap-1">
        <p className="mb-1">Your appointment has been successfully booked!</p>
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{booking.date}</span>
          <Clock className="h-4 w-4 ml-2 text-primary" />
          <span>{booking.time}</span>
        </div>
        <p className="font-medium mt-1">{booking.salonName}</p>
        
        {booking.services && booking.services.length > 0 ? (
          <div className="mt-1 pt-1 border-t">
            {booking.services.map((service, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{service.name}</span>
                <span>${service.price}</span>
              </div>
            ))}
            {booking.totalPrice && (
              <div className="flex justify-between font-medium text-sm mt-1 pt-1 border-t">
                <span>Total:</span>
                <span>${booking.totalPrice}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
        )}
      </div>
    ),
    variant: "default"
  });
};
