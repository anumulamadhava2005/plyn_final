import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { showBookingSuccessNotification } from "@/components/booking/BookingSuccessNotification";
import { addMinutes, format, parseISO, isBefore, isAfter } from "date-fns";
import { findAvailableWorker } from "./workerUtils";

// Interface for booking data
export interface BookingData {
  userId: string;
  salonId: string;
  salonName: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  email: string;
  phone: string;
  totalPrice: number;
  totalDuration: number;
  slotId: string;
  notes?: string;
  coinsUsed?: number;
  coinsEarned?: number;
  workerId?: string;
}

// Interface for payment data
export interface PaymentData {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  coinsUsed?: number;
  coinsEarned?: number;
}

// Mock function for initializing database (for development purposes)
export const initializeDatabase = async () => {
  console.log("Database initialization function called (development mock)");
  return { success: true, message: "Mock initialization - no actual changes made" };
};

// Function to create a new booking in the database
export const createBooking = async (bookingData: BookingData) => {
  try {
    console.log("Creating booking with data:", bookingData);
    
    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: bookingData.userId,
        merchant_id: bookingData.salonId,
        salon_id: bookingData.salonId,
        salon_name: bookingData.salonName,
        service_name: bookingData.serviceName,
        booking_date: bookingData.date,
        time_slot: bookingData.timeSlot,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        service_price: bookingData.totalPrice,
        service_duration: bookingData.totalDuration,
        slot_id: bookingData.slotId,
        status: "upcoming",
        additional_notes: bookingData.notes || "",
        coins_used: bookingData.coinsUsed || 0,
        coins_earned: bookingData.coinsEarned || 0,
        user_profile_id: bookingData.userId,
        worker_id: bookingData.workerId
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error in createBooking:", bookingError);
      throw bookingError;
    }

    console.log("Booking created successfully:", newBooking);
    return newBooking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Function to create a payment record
export const createPayment = async (paymentData: PaymentData) => {
  try {
    console.log("Creating payment with data:", paymentData);
    
    // For development purposes, always create a successful payment
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: paymentData.bookingId,
        user_id: paymentData.userId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        payment_status: "completed",
        transaction_id: `DEV-${Math.floor(Math.random() * 1000000)}`,
        coins_used: paymentData.coinsUsed || 0,
        coins_earned: paymentData.coinsEarned || 0
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error in createPayment:", paymentError);
      throw paymentError;
    }

    // Update the booking with the payment ID
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ payment_id: newPayment.id })
      .eq("id", paymentData.bookingId);

    if (updateError) {
      console.error("Error updating booking with payment_id:", updateError);
      throw updateError;
    }

    console.log("Payment created successfully:", newPayment);
    return newPayment;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

// Function to get user's PLYN coins
export const getUserCoins = async (userId: string) => {
  try {
    console.log("Fetching coins for user:", userId);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error in getUserCoins:", error);
      throw error;
    }
    
    const coins = data?.coins || 0;
    console.log("User coins retrieved:", coins);
    return coins;
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return 0;
  }
};

// Function to update user's PLYN coins
export const updateUserCoins = async (userId: string, coinsEarned: number, coinsUsed: number) => {
  try {
    console.log(`Updating coins for user ${userId}: earned ${coinsEarned}, used ${coinsUsed}`);
    
    const { data: userData, error: fetchError } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching current coin balance:", fetchError);
      throw fetchError;
    }
    
    const currentCoins = userData?.coins || 0;
    const newCoinsBalance = currentCoins + coinsEarned - coinsUsed;
    
    console.log(`Current coins: ${currentCoins}, New balance: ${newCoinsBalance}`);
    
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ coins: newCoinsBalance })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating coin balance:", updateError);
      throw updateError;
    }
    
    console.log("Coins updated successfully. New balance:", newCoinsBalance);
    return newCoinsBalance;
  } catch (error) {
    console.error("Error updating user coins:", error);
    throw error;
  }
};

// Function to fetch user's bookings - update to use the correct relationship
export const fetchUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles:user_profile_id(*)
      `)
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// Function to update a booking status
export const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

// Enhanced function to check slot availability with worker assignment
export const checkSlotAvailability = async (salonId: string, date: string, timeSlot: string, serviceDuration: number = 30) => {
  try {
    console.log(`Checking slot availability for salon ${salonId} on ${date} at ${timeSlot}`);
    
    // First check if the slot exists and is available
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", salonId)
      .eq("date", date)
      .eq("start_time", timeSlot)
      .eq("is_booked", false)
      .limit(1);

    if (error) {
      console.error("Error checking slot availability:", error);
      throw error;
    }
    
    // If no slots are found, try to find an available worker
    if (!data || data.length === 0) {
      // Try to find an available worker
      const availableWorker = await findAvailableWorker(salonId, date, timeSlot, serviceDuration);
      
      if (!availableWorker) {
        console.log("No available workers found for the requested time");
        return {
          available: false,
          slotId: null,
          workerId: null
        };
      }
      
      // Create a new slot for this worker
      const endTimeDate = addMinutes(new Date(`${date}T${timeSlot}`), serviceDuration);
      const endTime = format(endTimeDate, "HH:mm");
      
      const { data: newSlot, error: createError } = await supabase
        .from("slots")
        .insert({
          merchant_id: salonId,
          date,
          start_time: timeSlot,
          end_time: endTime,
          is_booked: false,
          service_duration: serviceDuration,
          worker_id: availableWorker.workerId
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating new slot:", createError);
        throw createError;
      }
      
      console.log("Created new slot with worker assignment:", newSlot);
      return {
        available: true,
        slotId: newSlot.id,
        workerId: availableWorker.workerId
      };
    }
    
    // If existing slot doesn't have a worker assigned, find one
    let slotToUse = data[0];
    if (!slotToUse.worker_id) {
      const availableWorker = await findAvailableWorker(salonId, date, timeSlot, serviceDuration);
      
      if (availableWorker) {
        // Update the slot with the worker ID
        const { data: updatedSlot, error: updateError } = await supabase
          .from("slots")
          .update({ worker_id: availableWorker.workerId })
          .eq("id", slotToUse.id)
          .select()
          .single();
          
        if (updateError) {
          console.error("Error updating slot with worker:", updateError);
        } else {
          slotToUse = updatedSlot;
        }
      }
    }
    
    console.log("Available slot found:", slotToUse);
    return {
      available: true,
      slotId: slotToUse.id,
      workerId: slotToUse.worker_id
    };
  } catch (error) {
    console.error("Error checking slot availability:", error);
    throw error;
  }
};

// Enhanced function to book a slot with worker assignment
export const bookSlot = async (slotId: string) => {
  try {
    console.log("Booking slot:", slotId);
    
    // First check if slot is still available
    const { data: slotData, error: checkError } = await supabase
      .from("slots")
      .select("*")
      .eq("id", slotId)
      .eq("is_booked", false)
      .single();
    
    if (checkError) {
      if (checkError.code === "PGRST116") {
        // No rows returned, slot is already booked
        console.error("Slot is already booked");
        throw new Error("This slot has already been booked by another customer.");
      }
      console.error("Error checking slot availability:", checkError);
      throw checkError;
    }
    
    // Update the slot to mark it as booked
    const { data, error } = await supabase
      .from("slots")
      .update({ is_booked: true })
      .eq("id", slotId)
      .eq("is_booked", false) // Ensure it hasn't been booked in the meantime
      .select()
      .single();
      
    if (error) {
      console.error("Error booking slot:", error);
      throw error;
    }
    
    if (!data) {
      console.error("Slot was booked by someone else");
      throw new Error("Slot was booked by someone else while processing your request.");
    }
    
    // After booking, generate new available slots to fill any gaps
    // This ensures dynamic slot generation right after a booking
    const merchantId = data.merchant_id;
    const slotDate = data.date;
    const workerId = data.worker_id;
    
    // Get the service durations offered by this merchant to create appropriate slots
    const { data: serviceData } = await supabase
      .from('services')
      .select('duration')
      .eq('merchant_id', merchantId);
      
    const serviceDurations = serviceData?.map(s => s.duration) || [30];
    
    // Generate new slots in background (don't await)
    createDynamicTimeSlots(merchantId, slotDate, serviceDurations)
      .then(newSlots => {
        console.log(`Generated ${newSlots.length} new dynamic slots after booking`);
      })
      .catch(err => {
        console.error("Error generating new slots after booking:", err);
      });
    
    console.log("Slot booked successfully:", data);
    return data;
  } catch (error) {
    console.error("Error booking slot:", error);
    throw error;
  }
};

// Enhanced function to create dynamic time slots based on services and available gaps
export const createDynamicTimeSlots = async (merchantId: string, date: string, serviceDurations: number[] = [30]) => {
  try {
    // Default working hours from 9:00 to 17:00 (5:00 PM)
    const workingStartHour = 9;
    const workingEndHour = 17;
    
    // Get existing slots for this date
    const { data: existingSlots, error: existingError } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("date", date);
      
    if (existingError) throw existingError;
    
    // If slots already exist for this date, we'll only add more if there are gaps
    if (existingSlots && existingSlots.length > 0) {
      console.log(`${existingSlots.length} slots already exist for ${date}, checking for gaps`);
      
      // Sort existing slots by start time
      const sortedExistingSlots = [...existingSlots].sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });
      
      // Find gaps in the existing slots to fill with new slots
      const gapsToFill = findTimeGaps(sortedExistingSlots, date, workingStartHour, workingEndHour);
      
      // If there are gaps, create slots for them
      if (gapsToFill.length > 0) {
        const newSlots = createSlotsForGaps(gapsToFill, merchantId, date, serviceDurations);
        
        if (newSlots.length > 0) {
          const { data: insertedSlots, error: insertError } = await supabase
            .from("slots")
            .insert(newSlots)
            .select();
            
          if (insertError) throw insertError;
          
          console.log(`Created ${insertedSlots?.length || 0} new slots to fill gaps`);
          return [...existingSlots, ...(insertedSlots || [])];
        }
      }
      
      return existingSlots;
    }
    
    // If no slots exist for this date, create a full day of slots
    const slots = [];
    const slotsSeen = new Set(); // To avoid duplicate slots
    
    // Ensure we have at least one service duration
    if (serviceDurations.length === 0) {
      serviceDurations = [30]; // Default 30 minute slots
    }
    
    // Get the smallest service duration to use as our increment
    const minDuration = Math.min(...serviceDurations);
    
    // Create slots for each increment throughout the working day
    let currentDate = new Date(`${date}T0${workingStartHour}:00:00`);
    const endTime = new Date(`${date}T${workingEndHour}:00:00`);
    
    while (currentDate < endTime) {
      const startTimeStr = format(currentDate, "HH:mm");
      
      // For each service duration, create a slot
      for (const duration of serviceDurations) {
        const potentialEndTime = addMinutes(currentDate, duration);
        
        // Only create slot if it fits within working hours
        if (potentialEndTime <= endTime) {
          const endTimeStr = format(potentialEndTime, "HH:mm");
          
          // Create a unique key to avoid duplicate slots
          const slotKey = `${startTimeStr}-${endTimeStr}`;
          
          if (!slotsSeen.has(slotKey)) {
            slots.push({
              merchant_id: merchantId,
              date: date,
              start_time: startTimeStr,
              end_time: endTimeStr,
              is_booked: false,
              service_duration: duration
            });
            
            slotsSeen.add(slotKey);
          }
        }
      }
      
      // Move to the next increment using minDuration
      currentDate = addMinutes(currentDate, minDuration);
    }
    
    // If we have slots to create, insert them
    if (slots.length > 0) {
      const { data, error } = await supabase
        .from("slots")
        .insert(slots)
        .select();
        
      if (error) throw error;
      
      console.log(`Created ${data.length} dynamic slots for ${date}`);
      return data;
    }
    
    return [];
  } catch (error) {
    console.error("Error creating dynamic time slots:", error);
    throw error;
  }
};

// Helper function to find time gaps in existing slots
function findTimeGaps(existingSlots: any[], date: string, startHour: number, endHour: number) {
  const gaps = [];
  const workDayStart = new Date(`${date}T0${startHour}:00:00`);
  const workDayEnd = new Date(`${date}T${endHour}:00:00`);
  
  // Create a timeline of occupied periods
  const occupiedPeriods = existingSlots.map(slot => {
    const startTime = new Date(`${date}T${slot.start_time}:00`);
    const endTime = new Date(`${date}T${slot.end_time}:00`);
    return { start: startTime, end: endTime };
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
  
  if (occupiedPeriods.length === 0) {
    // If no slots exist, return the entire working day as a gap
    return [{ start: workDayStart, end: workDayEnd }];
  }
  
  // Check if there's a gap at the beginning of the day
  if (isAfter(occupiedPeriods[0].start, workDayStart)) {
    gaps.push({
      start: workDayStart,
      end: occupiedPeriods[0].start
    });
  }
  
  // Check for gaps between slots
  for (let i = 0; i < occupiedPeriods.length - 1; i++) {
    const currentEnd = occupiedPeriods[i].end;
    const nextStart = occupiedPeriods[i + 1].start;
    
    if (isAfter(nextStart, currentEnd)) {
      gaps.push({
        start: currentEnd,
        end: nextStart
      });
    }
  }
  
  // Check if there's a gap at the end of the day
  const lastSlot = occupiedPeriods[occupiedPeriods.length - 1];
  if (isBefore(lastSlot.end, workDayEnd)) {
    gaps.push({
      start: lastSlot.end,
      end: workDayEnd
    });
  }
  
  return gaps;
}

// Helper function to create slots for the identified gaps
function createSlotsForGaps(gaps: any[], merchantId: string, date: string, serviceDurations: number[]) {
  const newSlots = [];
  const slotsSeen = new Set();
  
  // Get the smallest service duration to use as our increment
  const minDuration = Math.min(...serviceDurations);
  
  for (const gap of gaps) {
    let currentTime = new Date(gap.start);
    
    while (currentTime < gap.end) {
      const startTimeStr = format(currentTime, "HH:mm");
      
      // For each service duration, create a slot if it fits in the gap
      for (const duration of serviceDurations) {
        const potentialEndTime = addMinutes(currentTime, duration);
        
        // Only create slot if it fits within the gap
        if (potentialEndTime <= gap.end) {
          const endTimeStr = format(potentialEndTime, "HH:mm");
          
          // Create a unique key to avoid duplicate slots
          const slotKey = `${startTimeStr}-${endTimeStr}`;
          
          if (!slotsSeen.has(slotKey)) {
            newSlots.push({
              merchant_id: merchantId,
              date: date,
              start_time: startTimeStr,
              end_time: endTimeStr,
              is_booked: false,
              service_duration: duration
            });
            
            slotsSeen.add(slotKey);
          }
        }
      }
      
      // Move to the next increment
      currentTime = addMinutes(currentTime, minDuration);
    }
  }
  
  return newSlots;
}

// Enhanced function to fetch merchant slots with worker information
export const fetchMerchantSlots = async (merchantId: string, date?: string) => {
  try {
    let query = supabase
      .from("slots")
      .select(`
        *,
        workers (id, name, specialty)
      `)
      .eq("merchant_id", merchantId);
    
    if (date) {
      query = query.eq("date", date);
    }
    
    const { data, error } = await query.order("date").order("start_time");

    if (error) {
      console.error("Error fetching merchant slots:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchMerchantSlots:", error);
    throw error;
  }
};

// Enhanced function to fetch available slots with worker information
export const fetchAvailableSlots = async (salonId: string, date: string, serviceDuration: number = 30) => {
  try {
    // First try to find slots with existing workers
    const { data, error } = await supabase
      .from("slots")
      .select(`
        *,
        workers (id, name, specialty)
      `)
      .eq("merchant_id", salonId)
      .eq("date", date)
      .eq("is_booked", false)
      .order("start_time");

    if (error) throw error;
    
    // Filter out slots that are in the past
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm");
    
    const availableSlotsWithWorkers = (data || []).filter(slot => {
      // If the slot date is today, check if the time has passed
      if (date === today) {
        return slot.start_time > currentTime;
      }
      // For future dates, include all slots
      return true;
    });
    
    // If no slots with workers are found, get all possible slots with available workers
    if (!availableSlotsWithWorkers.length) {
      // This will generate slots based on worker availability
      const timeSlots = await findAvailableTimeSlots(salonId, date, serviceDuration);
      
      // Convert to the same format as slots
      const generatedSlots = timeSlots.map(timeSlot => ({
        id: `generated-${timeSlot.time}`,
        merchant_id: salonId,
        date: date,
        start_time: timeSlot.time,
        end_time: format(addMinutes(new Date(`${date}T${timeSlot.time}`), serviceDuration), "HH:mm"),
        is_booked: false,
        service_duration: serviceDuration,
        workers: timeSlot.availableWorkers.map(worker => ({
          id: worker.workerId,
          name: worker.name,
          specialty: worker.specialty
        })),
        // These are virtual slots that don't exist in the database yet
        is_virtual: true
      }));
      
      return generatedSlots;
    }
    
    return availableSlotsWithWorkers || [];
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
};

// Subscribe to real-time updates for slot availability
export const subscribeToSlotUpdates = (salonId: string, date: string, callback: Function) => {
  const channel = supabase
    .channel('slot-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'slots',
        filter: `merchant_id=eq.${salonId}~and~date=eq.${date}`
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
