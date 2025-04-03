
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvailableSlotsWithWorkers } from '@/utils/workerSchedulingUtils';
import { supabase } from '@/integrations/supabase/client';
import { formatToISODate } from '@/lib/date-utils';

interface BookingCalendarProps {
  salonId: string;
  selectedDate: Date;
  selectedTime: string | null;
  serviceDuration?: number;
  onDateChange: (date: Date) => void;
  onTimeSelect: (time: string, slotId: string, workerId?: string, workerName?: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  salonId,
  selectedDate,
  selectedTime,
  serviceDuration = 30,
  onDateChange,
  onTimeSelect
}) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<Array<{
    time: string; 
    availableWorkers: Array<{
      workerId: string;
      name: string;
      nextAvailableTime: string;
      specialty?: string;
    }>;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [hasExistingSlots, setHasExistingSlots] = useState<{[key: string]: {id: string, workerId: string, isBooked: boolean}}>({});
  
  // When date changes, fetch available slots
  useEffect(() => {
    if (salonId && selectedDate) {
      fetchAvailableSlots();
    }
  }, [salonId, selectedDate, serviceDuration]);
  
  // Fetch available time slots for the selected date
  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateString = formatToISODate(selectedDate);
      console.log(`Fetching slots for date: ${dateString}`);
      
      // Get available time slots with workers for this date and service duration
      const slots = await getAvailableSlotsWithWorkers(
        salonId, 
        dateString, 
        serviceDuration
      );
      
      console.log(`Found ${slots.length} available slots for ${dateString}`);
      setAvailableTimeSlots(slots);
      
      // Check if we have any existing slots in the database
      const { data } = await supabase
        .from('slots')
        .select('id, start_time, worker_id, is_booked')
        .eq('merchant_id', salonId)
        .eq('date', dateString);
        
      // Create a map of existing slots
      const existingSlotsMap: {[key: string]: {id: string, workerId: string, isBooked: boolean}} = {};
      
      if (data) {
        data.forEach(slot => {
          if (!existingSlotsMap[slot.start_time] || !slot.is_booked) {
            existingSlotsMap[slot.start_time] = {
              id: slot.id,
              workerId: slot.worker_id,
              isBooked: slot.is_booked
            };
          }
        });
      }
      
      // Update the state with existing slots
      setHasExistingSlots(existingSlotsMap);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Disable dates before today
  const disabledDates = {
    before: startOfDay(new Date())
  };

  // Format slots for display
  const renderTimeSlots = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-md" />
          ))}
        </div>
      );
    }

    if (availableTimeSlots.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No available slots for this date.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2">
        {availableTimeSlots.map(({ time, availableWorkers }) => {
          const isSelected = time === selectedTime;
          const slotInfo = hasExistingSlots[time];
          
          // Check if there's an existing slot in the database for this time
          // If not, we'll create it later with worker assignment
          const slotId = slotInfo && !slotInfo.isBooked ? slotInfo.id : '';
          
          // Use the first available worker for this slot
          const firstWorker = availableWorkers[0];
          
          return (
            <Button
              key={time}
              size="sm"
              variant={isSelected ? "default" : "outline"}
              className={`${isSelected ? '' : 'hover:bg-primary/10'}`}
              onClick={() => onTimeSelect(
                time, 
                slotId, 
                firstWorker.workerId,
                firstWorker.name
              )}
            >
              {time}
              {availableWorkers.length > 1 && (
                <span className="ml-1 text-xs opacity-70">
                  ({availableWorkers.length})
                </span>
              )}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateChange(date)}
        disabled={disabledDates}
        className="rounded-md border"
      />
      
      <div>
        <h3 className="text-sm font-medium mb-2">
          Available Times for {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        {renderTimeSlots()}
      </div>
    </div>
  );
};

export default BookingCalendar;
