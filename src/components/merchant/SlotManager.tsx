import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { supabase } from '@/integrations/supabase/client';
import { generateSalonTimeSlots, fetchAvailableSlots } from '@/utils/bookingUtils';

const formSchema = z.object({
  startTime: z.string().min(1, {
    message: "Start time is required.",
  }),
  endTime: z.string().min(1, {
    message: "End time is required.",
  }),
  serviceDuration: z.string().min(1, {
    message: "Service duration is required.",
  }),
})

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  merchant_id: string;
  service_duration: number;
}

const SlotManager = ({ merchantId }: { merchantId: string }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      serviceDuration: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  useEffect(() => {
    if (merchantId && date) {
      fetchSlots();
    }
  }, [merchantId, date]);

  const fetchSlots = async () => {
    if (!date) return;

    const dateString = format(date, 'yyyy-MM-dd');

    try {
      const availableSlots = await fetchAvailableSlots(merchantId, dateString);
      setSlots(availableSlots);
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      toast({
        title: 'Error fetching slots',
        description: error.message || 'Could not fetch slots',
        variant: 'destructive',
      });
      setSlots([]);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
  };

  const handleOpenDialog = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedSlot(null);
    setIsDialogOpen(false);
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    try {
      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', selectedSlot.id);

      if (error) {
        console.error("Error deleting slot:", error);
        toast({
          title: "Error deleting slot",
          description: error.message || "Could not delete the slot",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Slot deleted",
        description: "The slot has been successfully deleted.",
      });

      fetchSlots();
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      toast({
        title: "Error deleting slot",
        description: error.message || "Could not delete the slot",
        variant: "destructive",
      });
    } finally {
      handleCloseDialog();
    }
  };

  const handleGenerateSlots = async () => {
    if (!date) {
      toast({
        title: "Please select a date",
        description: "Select a date to generate slots for.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const dateString = format(date, 'yyyy-MM-dd');

    try {
      await generateSalonTimeSlots(merchantId, dateString);
      toast({
        title: "Slots generated",
        description: "Available time slots have been generated successfully.",
      });
      fetchSlots();
    } catch (error: any) {
      console.error("Error generating slots:", error);
      toast({
        title: "Error generating slots",
        description: error.message || "Could not generate time slots",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isDateBlocked = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-md rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl">Manage Time Slots</CardTitle>
          <CardDescription>
            View and manage available time slots for your salon.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="date">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "w-[240px] justify-start text-left font-normal" +
                      (date ? " text-foreground" : " text-muted-foreground")
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  sideOffset={6}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={isDateBlocked}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleGenerateSlots} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Slots"}
            </Button>
          </div>

          <div className="relative overflow-x-auto">
            <Table>
              <TableCaption>
                A list of your available time slots.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Service Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">
                      {format(new Date(slot.date), "PPP")}
                    </TableCell>
                    <TableCell>{slot.start_time}</TableCell>
                    <TableCell>{slot.end_time}</TableCell>
                    <TableCell>{slot.service_duration} minutes</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleOpenDialog(slot)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {slots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No slots available for this date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete{" "}
              {selectedSlot?.start_time} slot on{" "}
              {selectedSlot?.date ? format(new Date(selectedSlot.date), "PPP") : ""}{" "}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSlot}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SlotManager;
