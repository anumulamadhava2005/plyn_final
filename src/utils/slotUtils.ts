import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, addDays } from "date-fns";

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

// Add default data for development purposes
export const seedDefaultData = async () => {
  try {
    // Check if default merchants exist
    const { data: existingMerchants, error: checkError } = await supabase
      .from("merchants")
      .select("id");
    
    if (checkError) throw checkError;
    
    // If default merchants already exist, don't seed
    if (existingMerchants && existingMerchants.length > 0) {
      console.log("Default data already exists");
      return { success: true, message: "Default data already exists" };
    }
    
    // Add default salons/merchants
    const defaultMerchants = [
      {
        id: "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
        business_name: "Men's Style Barber Shop",
        business_address: "123 Main Street, Downtown",
        business_phone: "555-123-4567",
        business_email: "info@mensstyle.com",
        service_category: "men"
      },
      {
        id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        business_name: "Glamour Women's Salon",
        business_address: "456 Fashion Avenue, Uptown",
        business_phone: "555-987-6543",
        business_email: "info@glamoursalon.com",
        service_category: "women"
      }
    ];
    
    const { error: merchantError } = await supabase
      .from("merchants")
      .insert(defaultMerchants);
    
    if (merchantError) throw merchantError;
    
    // Generate slots for the next 7 days for each merchant
    const today = new Date();
    for (const merchant of defaultMerchants) {
      for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
        await generateSalonTimeSlots(merchant.id, date);
      }
    }
    
    return { success: true, message: "Default data seeded successfully" };
  } catch (error) {
    console.error("Error seeding default data:", error);
    return { success: false, message: "Error seeding default data", error };
  }
};
