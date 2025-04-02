
import { addDays, format, isAfter, isBefore, parse, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getAvailableTimeSlots, generateSalonTimeSlots, findAvailableTimeSlots } from './slotUtils';
import { WorkerAvailability } from '@/types/admin';

// Export functions from slotUtils that are imported by other files
export { getAvailableTimeSlots as fetchAvailableSlots } from './slotUtils';
export { generateSalonTimeSlots as createDynamicTimeSlots } from './slotUtils';
export { generateSalonTimeSlots } from './slotUtils';
export { findAvailableTimeSlots } from './slotUtils';

// Fetch merchant slots
export const fetchMerchantSlots = async (merchantId: string) => {
  const { data, error } = await supabase
    .from('slots')
    .select(`
      *,
      workers (
        id,
        name,
        specialty
      )
    `)
    .eq('merchant_id', merchantId);

  if (error) {
    console.error("Error fetching merchant slots:", error);
    throw new Error(`Error fetching slots: ${error.message}`);
  }

  return data || [];
};

// Check slot availability
export const checkSlotAvailability = async (
  merchantId: string,
  date: string,
  time: string
): Promise<{ available: boolean; slotId: string }> => {
  try {
    const { data, error } = await supabase
      .from('slots')
      .select('id, is_booked')
      .eq('merchant_id', merchantId)
      .eq('date', date)
      .eq('start_time', time)
      .single();

    if (error) {
      console.error("Error checking slot availability:", error);
      throw new Error(`Error checking availability: ${error.message}`);
    }

    return {
      available: !data.is_booked,
      slotId: data.id
    };
  } catch (error) {
    console.error("Error in checkSlotAvailability:", error);
    throw new Error("Could not check slot availability");
  }
};

// Book a slot
export const bookSlot = async (slotId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('slots')
      .update({ is_booked: true })
      .eq('id', slotId);

    if (error) {
      console.error("Error booking slot:", error);
      throw new Error(`Error booking slot: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in bookSlot:", error);
    throw new Error("Could not book the slot");
  }
};

// Create a booking
export const createBooking = async (bookingData: any): Promise<{ id: string }> => {
  try {
    // Remove payment_method field if it exists in bookingData
    if (bookingData.payment_method) {
      // Store it temporarily if we need it for a payment record
      const paymentMethod = bookingData.payment_method;
      delete bookingData.payment_method;
      
      // If we need to create a payment record with this method, we could do it here
      // For now, let's just log it
      console.log(`Payment will be processed using: ${paymentMethod}`);
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select('id')
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      throw new Error(`Error creating booking: ${error.message}`);
    }

    return { id: data.id };
  } catch (error) {
    console.error("Error in createBooking:", error);
    throw new Error("Could not create the booking");
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'pending'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      console.error("Error updating booking status:", error);
      throw new Error(`Error updating booking status: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    throw new Error("Could not update the booking status");
  }
};

// Fetch user bookings
export const fetchUserBookings = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false })
      .order('time_slot', { ascending: true });

    if (error) {
      console.error("Error fetching user bookings:", error);
      throw new Error(`Error fetching bookings: ${error.message}`);
    }

    // Convert status to match the expected format in the UI
    return (data || []).map(booking => ({
      ...booking,
      status: booking.status === 'confirmed' 
        ? 'upcoming' 
        : booking.status === 'cancelled' 
          ? 'cancelled' 
          : isBookingInPast(booking.booking_date) 
            ? 'completed' 
            : 'upcoming'
    }));
  } catch (error) {
    console.error("Error in fetchUserBookings:", error);
    throw new Error("Could not fetch the user bookings");
  }
};

// Helper function to check if a booking is in the past
const isBookingInPast = (bookingDate: string | null): boolean => {
  if (!bookingDate) return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = new Date(bookingDate);
    date.setHours(0, 0, 0, 0);
    
    return date < today;
  } catch {
    return false;
  }
};

// Update a booking
export const updateBooking = async (bookingId: string, bookingData: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update(bookingData)
      .eq('id', bookingId);

    if (error) {
      console.error("Error updating booking:", error);
      throw new Error(`Error updating booking: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in updateBooking:", error);
    throw new Error("Could not update the booking");
  }
};

// Get available workers
export const getAvailableWorkers = async (
  merchantId: string,
  date: string,
  time: string,
  duration: number
): Promise<WorkerAvailability[]> => {
  try {
    // First get all active workers for this merchant
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);

    if (workersError) throw workersError;
    
    if (!workers || workers.length === 0) {
      return [];
    }
    
    // For each worker, check if they're available at the requested time
    const availabilityChecks = workers.map(async (worker) => {
      // Check if worker has any unavailability for this date
      const { data: unavailability, error: unavailabilityError } = await supabase
        .from('worker_unavailability')
        .select('*')
        .eq('worker_id', worker.id)
        .eq('date', date);
        
      if (unavailabilityError) throw unavailabilityError;
      
      // Check if worker already has a booking at this time
      const { data: bookings, error: bookingsError } = await supabase
        .from('slots')
        .select('*')
        .eq('worker_id', worker.id)
        .eq('date', date)
        .eq('start_time', time)
        .eq('is_booked', true);
        
      if (bookingsError) throw bookingsError;
      
      const isAvailable = 
        (!unavailability || unavailability.length === 0) && 
        (!bookings || bookings.length === 0);
      
      if (isAvailable) {
        return {
          workerId: worker.id,
          name: worker.name,
          nextAvailableTime: time,
          specialty: worker.specialty
        };
      }
      
      return null;
    });
    
    const availabilities = await Promise.all(availabilityChecks);
    return availabilities.filter(Boolean) as WorkerAvailability[];
    
  } catch (error) {
    console.error("Error getting available workers:", error);
    throw new Error("Could not check worker availability");
  }
};

// Export getUserCoins for backward compatibility, but mark as deprecated
/**
 * @deprecated Use getUserCoins from userUtils.ts instead
 */
export const getUserCoins = async (userId: string): Promise<number> => {
  const { getUserCoins: getCoins } = await import('./userUtils');
  return getCoins(userId);
};
