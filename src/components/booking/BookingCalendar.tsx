
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { fetchAvailableSlots, createDynamicTimeSlots } from '@/utils/bookingUtils';
import { supabase } from "@/integrations/supabase/client";

interface BookingCalendarProps {
  salonId: string;
  onDateChange: (date: Date) => void;
  onTimeSelect: (time: string, slotId: string) => void;
  selectedDate: Date;
  selectedTime: string | null;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  salonId,
  onDateChange,
  onTimeSelect,
  selectedDate,
  selectedTime
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (salonId && selectedDate) {
      loadAvailableSlots();
    }
  }, [salonId, selectedDate]);

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // First, check if any slots exist for this date
      let slots = await fetchAvailableSlots(salonId, formattedDate);
      
      // If no slots exist, try to generate dynamic slots
      if (slots.length === 0) {
        setGeneratingSlots(true);
        
        // Fetch service durations for this merchant to create appropriate slots
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('duration')
          .eq('merchant_id', salonId);
        
        if (!serviceError && serviceData && serviceData.length > 0) {
          // Extract unique service durations
          const durations = [...new Set(serviceData.map(s => s.duration))];
          
          // Generate slots based on service durations
          await createDynamicTimeSlots(salonId, formattedDate, durations);
        } else {
          // If no service durations are found, create default slots with
          // multiple durations for flexibility (15, 30, 45, 60 minutes)
          await createDynamicTimeSlots(salonId, formattedDate, [15, 30, 45, 60]);
        }
        
        // Now fetch the newly created slots
        slots = await fetchAvailableSlots(salonId, formattedDate);
        setGeneratingSlots(false);
      }
      
      setAvailableSlots(slots);
    } catch (error: any) {
      console.error('Error loading slots:', error);
      toast({
        title: 'Error loading available times',
        description: error.message || 'Could not load available time slots',
        variant: 'destructive',
      });
      setAvailableSlots([]);
      setGeneratingSlots(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      // Clear selected time when date changes
      onTimeSelect('', '');
    }
  };

  const groupSlotsByHour = () => {
    const grouped: Record<string, any[]> = {};
    
    availableSlots.forEach(slot => {
      const hour = slot.start_time.split(':')[0];
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(slot);
    });
    
    return Object.entries(grouped).sort(([hourA], [hourB]) => 
      parseInt(hourA) - parseInt(hourB)
    );
  };

  // Format duration to display to the user (e.g., "30 min")
  const formatDuration = (slot: any) => {
    if (!slot.service_duration) return '';
    return `${slot.service_duration} min`;
  };

  // Calculate end time display for a slot
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = addMinutes(startDate, durationMinutes);
    return format(endDate, 'HH:mm');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Select Date</label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Available Times</label>
        {isLoading || generatingSlots ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            {generatingSlots && <p className="text-xs text-muted-foreground text-center mt-2">Generating available slots...</p>}
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="space-y-4">
            {groupSlotsByHour().map(([hour, slots]) => (
              <div key={hour} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {parseInt(hour) < 12 
                    ? `${hour} AM` 
                    : parseInt(hour) === 12 
                      ? '12 PM' 
                      : `${parseInt(hour) - 12} PM`}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTime === slot.start_time ? "default" : "outline"}
                      size="sm"
                      className="justify-start relative"
                      onClick={() => onTimeSelect(slot.start_time, slot.id)}
                    >
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                        <span className="ml-1 text-xs opacity-70">{formatDuration(slot)}</span>
                      </div>
                      {selectedTime === slot.start_time && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/40 rounded-md p-4 text-center">
            <p className="text-muted-foreground">
              {selectedDate 
                ? 'No available time slots for the selected date' 
                : 'Please select a date to see available times'}
            </p>
            {selectedDate && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  const tomorrow = new Date(selectedDate);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleDateSelect(tomorrow);
                }}
              >
                Try tomorrow
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
