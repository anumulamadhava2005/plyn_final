
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import BookingCalendar from './BookingCalendar';
import { checkSlotAvailability, bookSlot } from '@/utils/bookingUtils';
import { useAuth } from '@/context/AuthContext';
import { formatToISODate } from '@/lib/date-utils';

interface BookingFormProps {
  salonId: string;
  salonName: string;
  selectedServices: any[];
  totalPrice: number;
  totalDuration: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  salonId,
  salonName,
  selectedServices,
  totalPrice,
  totalDuration
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedWorkerName, setSelectedWorkerName] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
  }, [user]);

  const handleDateChange = (date: Date) => {
    console.log(`Date changed to: ${date.toISOString()}`);
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedSlotId('');
    setSelectedWorkerId(null);
    setSelectedWorkerName(null);
  };

  const handleTimeSelect = (time: string, slotId: string, workerId?: string, workerName?: string) => {
    console.log(`Time selected: ${time}, SlotId: ${slotId || 'new'}, WorkerId: ${workerId || 'none'}`);
    setSelectedTime(time);
    setSelectedSlotId(slotId);
    setSelectedWorkerId(workerId || null);
    setSelectedWorkerName(workerName || null);
  };

  const validateForm = () => {
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select an appointment date",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedTime) {
      toast({
        title: "Time required",
        description: "Please select an appointment time",
        variant: "destructive",
      });
      return false;
    }

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return false;
    }

    if (!phone) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login or sign up to book an appointment",
        variant: "destructive",
      });
      
      sessionStorage.setItem('pendingBooking', JSON.stringify({
        salonId,
        salonName,
        selectedServices,
        totalPrice,
        totalDuration,
        selectedDate: selectedDate.toISOString(),
        selectedTime,
        selectedSlotId,
        selectedWorkerId,
        selectedWorkerName,
        email,
        phone,
        notes
      }));
      
      navigate('/auth', { state: { redirectAfterAuth: `/book/${salonId}` } });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = formatToISODate(selectedDate);
      console.log(`Proceeding with date: ${formattedDate} and time: ${selectedTime}`);
      
      let slotIdToUse = selectedSlotId;
      let workerIdToUse = selectedWorkerId;
      let workerNameToUse = selectedWorkerName;
      
      // If no slot ID or empty slot ID, check availability and create a new slot
      if (!slotIdToUse || slotIdToUse === '') {
        console.log("No valid slot ID, checking availability...");
        const { available, slotId, workerId, workerName } = await checkSlotAvailability(
          salonId, 
          formattedDate, 
          selectedTime || '',
          totalDuration
        );
        
        if (!available || !slotId) {
          toast({
            title: "Slot no longer available",
            description: "Sorry, this time slot has just been booked. Please select another time.",
            variant: "destructive",
          });
          setSelectedTime(null);
          setSelectedSlotId('');
          setSelectedWorkerId(null);
          setSelectedWorkerName(null);
          setIsSubmitting(false);
          return;
        }
        
        slotIdToUse = slotId;
        console.log(`Created new slot with ID: ${slotId}`);
        
        if (workerId) workerIdToUse = workerId;
        if (workerName) workerNameToUse = workerName;
      }
      
      // Final check for valid slot ID before proceeding
      if (!slotIdToUse || slotIdToUse === '') {
        toast({
          title: "No available slot",
          description: "Could not find or create an available slot. Please try another time.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log(`Using slot ID: ${slotIdToUse}`);
      
      const serviceName = selectedServices.map(s => s.name).join(', ');
      
      navigate('/payment', {
        state: {
          salonId,
          salonName,
          services: selectedServices,
          date: formattedDate,
          timeSlot: selectedTime,
          email,
          phone,
          notes,
          totalPrice,
          totalDuration,
          slotId: slotIdToUse,
          workerId: workerIdToUse,
          workerName: workerNameToUse
        }
      });
    } catch (error: any) {
      console.error("Error proceeding to payment:", error);
      toast({
        title: "Booking error",
        description: error.message || "An error occurred while processing your booking",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <BookingCalendar
              salonId={salonId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={handleDateChange}
              onTimeSelect={handleTimeSelect}
              serviceDuration={totalDuration}
            />
            
            {selectedWorkerName && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <p className="text-sm font-medium">Your stylist will be:</p>
                <p className="text-lg font-semibold text-primary">{selectedWorkerName}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or information for your appointment"
              rows={4}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedTime || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;
