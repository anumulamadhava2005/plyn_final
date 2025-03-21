
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
        additional_notes: bookingData.notes || ""
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
    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: paymentData.bookingId,
        user_id: paymentData.userId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod,
        payment_status: paymentData.paymentStatus || "completed",
        transaction_id: paymentData.transactionId
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
