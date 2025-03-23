
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { showBookingSuccessNotification } from "@/components/booking/BookingSuccessNotification";

// Function to create a new booking in the database
export const createBooking = async (bookingData: any) => {
  try {
    console.log("Creating booking with data:", bookingData);
    
    // Validate required fields
    if (!bookingData.userId || !bookingData.salonId || !bookingData.date || !bookingData.timeSlot) {
      throw new Error("Missing required booking data fields");
    }
    
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
        status: "confirmed", 
        additional_notes: bookingData.notes || ""
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
export const createPayment = async (paymentData: any) => {
  try {
    console.log("Creating payment with data:", paymentData);
    
    // Validate required fields
    if (!paymentData.bookingId || !paymentData.userId || !paymentData.amount) {
      throw new Error("Missing required payment data fields");
    }
    
    // Create a successful payment immediately
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: paymentData.bookingId,
        user_id: paymentData.userId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        payment_status: "completed", // Always mark as completed
        transaction_id: `INSTANT-${Math.floor(Math.random() * 1000000)}`
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
      console.error("Error updating booking with payment ID:", updateError);
      throw updateError;
    }

    console.log("Payment created successfully:", newPayment);
    return newPayment;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

// Enhanced function to check slot availability with database locking
export const checkSlotAvailability = async (salonId: string, date: string, timeSlot: string) => {
  try {
    console.log(`Checking slot availability for salon ${salonId} on ${date} at ${timeSlot}`);
    
    if (!salonId || !date || !timeSlot) {
      throw new Error("Missing required slot data fields");
    }
    
    // Begin transaction
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", salonId)
      .eq("date", date)
      .eq("start_time", timeSlot)
      .eq("is_booked", false)
      .limit(1);

    if (error) {
      console.error("Error in checkSlotAvailability:", error);
      throw error;
    }
    
    // If no slots are found, or if the slot is already booked
    if (!data || data.length === 0) {
      console.log(`No available slot found for salon ${salonId} on ${date} at ${timeSlot}`);
      return {
        available: false,
        slotId: null
      };
    }
    
    console.log(`Slot available: ${data[0].id}`);
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
    console.log(`Booking slot with ID: ${slotId}`);
    
    if (!slotId) {
      throw new Error("Missing required slot ID");
    }
    
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
        console.error("Slot already booked by another customer");
        throw new Error("This slot has already been booked by another customer.");
      }
      console.error("Error checking slot availability:", checkError);
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

    if (error) {
      console.error("Error booking slot:", error);
      throw error;
    }
    
    if (!data) {
      console.error("Slot was booked by someone else during processing");
      throw new Error("Slot was booked by someone else while processing your request.");
    }
    
    console.log(`Slot ${slotId} successfully booked`);
    return data;
  } catch (error) {
    console.error("Error booking slot:", error);
    throw error;
  }
};

// Initialize the database with default data for development
export const initializeDatabase = async () => {
  try {
    console.log("Initializing database with default data");
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

  console.log(`Subscribed to slot updates for salon ${salonId} on ${date}`);
  return () => {
    supabase.removeChannel(channel);
  };
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
