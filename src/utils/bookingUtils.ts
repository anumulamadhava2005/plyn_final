import { supabase } from "@/integrations/supabase/client";
import { showBookingSuccessNotification } from "@/components/booking/BookingSuccessNotification";

// Define a proper type for bookingData
interface BookingData {
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
}

// Define the return type for the booking
interface BookingResponse {
  id: string;
  user_id: string;
  merchant_id: string;
  salon_id: string | null;
  salon_name: string | null;
  service_name: string;
  booking_date: string | null;
  time_slot: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  service_price: number | null;
  service_duration: number | null;
  slot_id: string;
  status: string;
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
  payment_id: string | null;
}

// Function to create a new booking in the database
export const createBooking = async (bookingData: BookingData): Promise<BookingResponse | null> => {
  const { data, error } = await supabase.rpc('create_booking_transaction', {
    p_user_id: bookingData.userId,
    p_merchant_id: bookingData.salonId,
    p_salon_id: bookingData.salonId,
    p_salon_name: bookingData.salonName,
    p_service_name: bookingData.serviceName,
    p_booking_date: bookingData.date,
    p_time_slot: bookingData.timeSlot,
    p_customer_email: bookingData.email,
    p_customer_phone: bookingData.phone,
    p_service_price: bookingData.totalPrice,
    p_service_duration: bookingData.totalDuration,
    p_slot_id: bookingData.slotId,
    p_additional_notes: bookingData.notes || ""
  });

  if (error) {
    console.error("Error in create_booking_transaction:", error);
    throw error;
  }

  // If the booking was created successfully, the RPC returns a JSONB object with success, message, and id
  if (data && data.success) {
    // Fetch the booking record to return the full booking object
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", data.id)
      .single();
      
    if (bookingError) {
      console.error("Error fetching booking after creation:", bookingError);
      throw bookingError;
    }
    
    return bookingData;
  }
  
  return null;
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
        transaction_id: `DEV-${Math.floor(Math.random() * 1000000)}`
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

// Function to check slot availability
export const checkSlotAvailability = async (salonId: string, date: string, timeSlot: string) => {
  try {
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", salonId)
      .eq("date", date)
      .eq("start_time", timeSlot)
      .eq("is_booked", false)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "no rows returned"
    
    return {
      available: !!data,
      slotId: data?.id
    };
  } catch (error) {
    console.error("Error checking slot availability:", error);
    throw error;
  }
};

// Function to mark a slot as booked
export const bookSlot = async (slotId: string) => {
  try {
    const { data, error } = await supabase
      .from("slots")
      .update({ is_booked: true })
      .eq("id", slotId)
      .select()
      .single();

    if (error) throw error;
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

// Function to subscribe to booking updates for a specific user
export const subscribeToBookingUpdates = (userId: string, callback: (bookings: any[]) => void) => {
  // Create a subscription channel
  const channel = supabase
    .channel('booking-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        // When booking changes are detected, get the updated list of bookings
        const bookings = await fetchUserBookings(userId);
        callback(bookings);
      }
    )
    .subscribe();

  // Return the channel so it can be unsubscribed later
  return channel;
};
