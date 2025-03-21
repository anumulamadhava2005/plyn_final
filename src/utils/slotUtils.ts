import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes } from "date-fns";

// Generate time slots for a salon
export const generateSalonTimeSlots = async (salonId: string, date: Date) => {
  try {
    // First check if slots already exist for this date and salon
    const { data: existingSlots, error: checkError } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", salonId)
      .eq("date", format(date, "yyyy-MM-dd"));
    
    if (checkError) throw checkError;
    
    // If slots already exist, return them
    if (existingSlots && existingSlots.length > 0) {
      return existingSlots;
    }
    
    // Otherwise, create new slots for this date
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM
    const slotDuration = 30; // 30 minute intervals
    
    let slots = [];
    let currentTime = new Date(date);
    currentTime.setHours(startHour, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);
    
    while (currentTime < endTime) {
      const startTimeStr = format(currentTime, "HH:mm");
      const endTimeStr = format(addMinutes(currentTime, slotDuration), "HH:mm");
      
      slots.push({
        merchant_id: salonId,
        date: format(date, "yyyy-MM-dd"),
        start_time: startTimeStr,
        end_time: endTimeStr,
        is_booked: false
      });
      
      currentTime = addMinutes(currentTime, slotDuration);
    }
    
    // Insert the slots into the database
    const { data: insertedSlots, error: insertError } = await supabase
      .from("slots")
      .insert(slots)
      .select();
    
    if (insertError) throw insertError;
    
    return insertedSlots;
  } catch (error) {
    console.error("Error generating salon time slots:", error);
    throw error;
  }
};

// Get available time slots for a salon
export const getAvailableTimeSlots = async (salonId: string, date: Date) => {
  try {
    // Ensure slots exist for this date
    await generateSalonTimeSlots(salonId, date);
    
    // Get available slots
    const { data: availableSlots, error } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", salonId)
      .eq("date", format(date, "yyyy-MM-dd"))
      .eq("is_booked", false)
      .order("start_time");
    
    if (error) throw error;
    
    return availableSlots || [];
  } catch (error) {
    console.error("Error getting available time slots:", error);
    throw error;
  }
};

// Format time slots for display
export const formatSlotsForDisplay = (slots: any[]) => {
  return slots.map(slot => ({
    id: slot.id,
    time: slot.start_time,
    available: !slot.is_booked
  }));
};
