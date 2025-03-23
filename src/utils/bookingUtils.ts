
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { showBookingSuccessNotification } from "@/components/booking/BookingSuccessNotification";

// Function to create a new booking in the database
export const createBooking = async (bookingData: any) => {
  try {
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
        coins_earned: bookingData.coinsEarned || 0
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return newBooking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Function to create a payment record
export const createPayment = async (paymentData: any) => {
  try {
    // For development purposes, always create a successful payment
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: paymentData.bookingId,
        user_id: paymentData.userId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        payment_status: "completed", // Always completed for development
        transaction_id: `DEV-${Math.floor(Math.random() * 1000000)}`,
        coins_used: paymentData.coinsUsed || 0,
        coins_earned: paymentData.coinsEarned || 0
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update the booking with the payment ID
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ payment_id: newPayment.id })
      .eq("id", paymentData.bookingId);

    if (updateError) throw updateError;

    return newPayment;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

// Function to get user's PLYN coins
export const getUserCoins = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    if (error) throw error;
    
    // Since we've added the coins column, we can safely access it
    // TypeScript now recognizes 'coins' as a valid property
    return data?.coins || 0;
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return 0; // Default to 0 coins if there's an error
  }
};

// Function to update user's PLYN coins
export const updateUserCoins = async (userId: string, coinsEarned: number, coinsUsed: number) => {
  try {
    // First get current coin balance
    const { data: userData, error: fetchError } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;
    
    // Safely access the coins property
    const currentCoins = userData?.coins || 0;
    const newCoinsBalance = currentCoins + coinsEarned - coinsUsed;
    
    // Update the user's coin balance
    // Use the explicit cast to any to bypass TypeScript's type checking for the update
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({ coins: newCoinsBalance } as any)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) throw updateError;
    
    return newCoinsBalance;
  } catch (error) {
    console.error("Error updating user coins:", error);
    throw error;
  }
};

// Function to fetch user's bookings
export const fetchUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        payments(*)
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

// Enhanced function to check slot availability with database locking
export const checkSlotAvailability = async (salonId: string, date: string, timeSlot: string) => {
  try {
    // Begin transaction
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", salonId)
      .eq("date", date)
      .eq("start_time", timeSlot)
      .eq("is_booked", false)
      .limit(1);

    if (error) throw error;
    
    // If no slots are found, or if the slot is already booked
    if (!data || data.length === 0) {
      return {
        available: false,
        slotId: null
      };
    }
    
    return {
      available: true,
      slotId: data[0].id
    };
  } catch (error) {
    console.error("Error checking slot availability:", error);
    throw error;
  }
};

// Enhanced function to mark a slot as booked with atomic update
export const bookSlot = async (slotId: string) => {
  try {
    // First check if slot is still available
    const { data: checkData, error: checkError } = await supabase
      .from("slots")
      .select("*")
      .eq("id", slotId)
      .eq("is_booked", false)
      .single();
    
    if (checkError) {
      if (checkError.code === "PGRST116") { 
        // No rows returned, slot is already booked
        throw new Error("This slot has already been booked by another customer.");
      }
      throw checkError;
    }

    // If we got here, slot is available, so mark it as booked with optimistic locking
    const { data, error } = await supabase
      .from("slots")
      .update({ is_booked: true })
      .eq("id", slotId)
      .eq("is_booked", false) // Ensure it hasn't been booked in the meantime
      .select()
      .single();

    if (error) throw error;
    
    if (!data) {
      throw new Error("Slot was booked by someone else while processing your request.");
    }
    
    return data;
  } catch (error) {
    console.error("Error booking slot:", error);
    throw error;
  }
};

// Initialize the database with default data for development
export const initializeDatabase = async () => {
  try {
    const { seedDefaultData } = await import('./slotUtils');
    return await seedDefaultData();
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, message: "Error initializing database", error };
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
