
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TimeSlot = {
  id: string;
  time: string;
  day: string;
  status: 'available' | 'booked' | 'unavailable';
};

type WorkingHoursGridProps = {
  slots: TimeSlot[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export const WorkingHoursGrid = ({ slots, selectedDate, onDateChange }: WorkingHoursGridProps) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [
    '9:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  const renderStatusBadge = (status: TimeSlot['status']) => {
    const styles = {
      available: "bg-primary/20 text-primary",
      booked: "bg-primary text-white",
      unavailable: "bg-gray-800 text-gray-500"
    };

    return (
      <div className={cn(
        "w-full py-2 text-center text-sm rounded",
        styles[status]
      )}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const getSlotForDayAndTime = (day: string, time: string) => {
    return slots.find(slot => slot.day === day && slot.time === time) || {
      id: `${day}-${time}`,
      day,
      time,
      status: 'unavailable' as const
    };
  };

  return (
    <Card className="bg-black/80 border-border/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Working Hours</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            {format(selectedDate, 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max grid grid-cols-8 gap-2">
            {/* Header row */}
            <div className="text-center text-muted-foreground py-2"></div>
            {days.map(day => (
              <div key={day} className="text-center font-medium py-2">
                {day}
              </div>
            ))}
            
            {/* Time slots grid */}
            {hours.map(time => (
              <React.Fragment key={time}>
                <div className="text-right pr-4 py-2 text-muted-foreground">
                  {time}
                </div>
                {days.map(day => (
                  <div key={`${day}-${time}`} className="py-2">
                    {renderStatusBadge(getSlotForDayAndTime(day, time).status)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHoursGrid;
