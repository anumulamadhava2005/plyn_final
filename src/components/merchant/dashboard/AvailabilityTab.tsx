
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, PlusCircle } from 'lucide-react';
import { SlotData } from '@/types/merchant';

interface AvailabilityTabProps {
  slots: SlotData[];
  handleCreateSlot: () => Promise<void>;
  handleNewSlotChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newSlot: {
    date: string;
    startTime: string;
    endTime: string;
  };
  formatDate: (dateString: string) => string;
  formatTime: (timeString: string) => string;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  slots,
  handleCreateSlot,
  handleNewSlotChange,
  newSlot,
  formatDate,
  formatTime
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Availability</CardTitle>
        <CardDescription>
          Add and manage your available time slots
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 border rounded-lg bg-background">
          <h3 className="font-medium text-lg mb-4">Add New Time Slot</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={newSlot.date}
                onChange={handleNewSlotChange}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                name="startTime" 
                type="time" 
                value={newSlot.startTime}
                onChange={handleNewSlotChange}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                name="endTime" 
                type="time" 
                value={newSlot.endTime}
                onChange={handleNewSlotChange}
                className="mt-1" 
              />
            </div>
          </div>
          <Button 
            className="w-full mt-4"
            onClick={handleCreateSlot}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-4">Your Available Slots</h3>
          
          {slots.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No Time Slots Added</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Add time slots above so customers can book appointments with you.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 gap-4 bg-muted p-4 font-medium">
                <div>Date</div>
                <div>Start Time</div>
                <div>End Time</div>
                <div>Status</div>
              </div>
              <div className="divide-y">
                {slots.map((slot) => (
                  <div key={slot.id} className="grid grid-cols-4 gap-4 p-4">
                    <div>{formatDate(slot.date)}</div>
                    <div>{formatTime(slot.start_time)}</div>
                    <div>{formatTime(slot.end_time)}</div>
                    <div>
                      {slot.is_booked ? (
                        <Badge>Booked</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityTab;
