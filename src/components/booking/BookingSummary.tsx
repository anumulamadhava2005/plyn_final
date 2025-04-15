
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { formatTime } from '@/lib/date-utils';

interface BookingSummaryProps {
  salonName: string;
  services: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
  date: string; 
  timeSlot: string;
  totalPrice: number;
  totalDuration: number;
  workerName?: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  salonName,
  services,
  date,
  timeSlot,
  totalPrice,
  totalDuration,
  workerName
}) => {
  // Format the date for display
  const formattedDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : '';
  
  // Format the time for display
  const formattedTime = timeSlot ? formatTime(timeSlot) : '';
  
  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalPrice);
  
  return (
    <Card className="bg-black/80 border-border/20">
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Salon</p>
          <p className="font-medium">{salonName}</p>
        </div>
        
        {workerName && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Stylist</p>
            <p className="font-medium">{workerName}</p>
          </div>
        )}
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Date & Time</p>
          <p className="font-medium">{formattedDate} at {formattedTime}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Services</p>
          {services.map((service, index) => (
            <div key={index} className="flex justify-between">
              <span>{service.name} ({service.duration} min)</span>
              <span>₹{service.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t border-border/30">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formattedPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total Duration</span>
            <span>{totalDuration} min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummary;
