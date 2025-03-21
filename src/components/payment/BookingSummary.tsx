
import React from 'react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Clock, CheckCircle } from 'lucide-react';

interface Service {
  name: string;
  price: number;
}

interface BookingSummaryProps {
  salonName: string;
  services: Service[];
  date: string | Date;
  timeSlot: string;
  totalDuration: number;
  totalPrice: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  salonName,
  services,
  date,
  timeSlot,
  totalDuration,
  totalPrice
}) => {
  const formattedDate = date instanceof Date 
    ? date
    : new Date(date);

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <div className={`rounded-md p-2 mr-3 ${
            salonName.includes("Men") || salonName.includes("Barber") 
              ? "bg-salon-men/10 text-salon-men" 
              : "bg-salon-women/10 text-salon-women"
          }`}>
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{salonName}</h3>
            <p className="text-sm text-muted-foreground">
              {services.length} service(s) selected
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">
              {format(formattedDate, "EEEE, MMMM d, yyyy")}
            </h3>
            <p className="text-sm text-muted-foreground">Appointment date</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{timeSlot}</h3>
            <p className="text-sm text-muted-foreground">
              Duration: {totalDuration} min
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-3">Selected Services</h3>
          <ul className="space-y-2">
            {services.map((service, index) => (
              <li key={index} className="flex justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>{service.name}</span>
                </div>
                <span className="font-medium">${service.price}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Total Amount</h3>
            <p className="text-sm text-muted-foreground">
              Including all services
            </p>
          </div>
          <div className="text-2xl font-bold">${totalPrice}</div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
