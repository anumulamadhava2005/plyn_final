
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes } from 'date-fns';
import { WorkerAvailability } from '@/types/admin';

/**
 * Check if a specific time slot is available for a given worker
 */
export const isWorkerAvailableForSlot = async (
  workerId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  try {
    // Check existing bookings
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('slots')
      .select('*')
      .eq('date', date)
      .eq('worker_id', workerId)
      .eq('is_booked', true);
      
    if (bookingsError) throw bookingsError;
    
    // Check worker unavailability periods
    const { data: unavailability, error: unavailabilityError } = await supabase
      .from('worker_unavailability')
      .select('*')
      .eq('date', date)
      .eq('worker_id', workerId);
      
    if (unavailabilityError) throw unavailabilityError;
    
    // Check for overlapping bookings
    const isOverlappingWithBooking = (existingBookings || []).some(booking => 
      (startTime < booking.end_time && endTime > booking.start_time)
    );
    
    // Check for overlapping with unavailability periods
    const isOverlappingWithUnavailability = (unavailability || []).some(period => 
      (startTime < period.end_time && endTime > period.start_time)
    );
    
    return !isOverlappingWithBooking && !isOverlappingWithUnavailability;
  } catch (error) {
    console.error('Error checking worker availability:', error);
    throw error;
  }
};

/**
 * Find the first available worker for a given time slot
 */
export const findAvailableWorker = async (
  merchantId: string,
  date: string,
  startTime: string,
  serviceDuration: number
): Promise<WorkerAvailability | null> => {
  try {
    // Get all active workers for this merchant
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);
      
    if (workersError) throw workersError;
    
    if (!workers || workers.length === 0) {
      console.log('No active workers found for merchant:', merchantId);
      return null;
    }
    
    // Calculate end time based on service duration
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = addMinutes(startDateTime, serviceDuration);
    const endTime = format(endDateTime, 'HH:mm');
    
    // Check each worker's availability
    for (const worker of workers) {
      const isAvailable = await isWorkerAvailableForSlot(
        worker.id, 
        date, 
        startTime, 
        endTime
      );
      
      if (isAvailable) {
        return {
          workerId: worker.id,
          name: worker.name,
          nextAvailableTime: endTime,
          specialty: worker.specialty
        };
      }
    }
    
    return null; // No available workers found
  } catch (error) {
    console.error('Error finding available worker:', error);
    throw error;
  }
};

/**
 * Create a new slot with automatic worker assignment
 */
export const createSlotWithAutoAssignment = async (
  merchantId: string,
  date: string,
  startTime: string,
  serviceDuration: number,
  serviceName?: string,
  servicePrice?: number
): Promise<{slotId: string, workerId: string, workerName: string} | null> => {
  try {
    // Find an available worker
    const availableWorker = await findAvailableWorker(
      merchantId,
      date,
      startTime,
      serviceDuration
    );
    
    if (!availableWorker) {
      console.log('No available workers found for the requested time');
      return null;
    }
    
    // Calculate end time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = addMinutes(startDateTime, serviceDuration);
    const endTime = format(endDateTime, 'HH:mm');
    
    // Create the slot
    const { data, error } = await supabase
      .from('slots')
      .insert({
        merchant_id: merchantId,
        date,
        start_time: startTime,
        end_time: endTime,
        worker_id: availableWorker.workerId,
        service_duration: serviceDuration,
        service_name: serviceName || null,
        service_price: servicePrice || 0,
        is_booked: false
      })
      .select('id')
      .single();
      
    if (error) throw error;
    
    return {
      slotId: data.id,
      workerId: availableWorker.workerId,
      workerName: availableWorker.name
    };
  } catch (error) {
    console.error('Error creating slot with auto assignment:', error);
    throw error;
  }
};

/**
 * Get all available time slots with assigned workers for a date and service
 */
export const getAvailableSlotsWithWorkers = async (
  merchantId: string,
  date: string,
  serviceDuration: number,
  interval: number = 10 // Changed from 15 to 10 minutes to match the backend
): Promise<Array<{time: string, availableWorkers: WorkerAvailability[]}>> => {
  try {
    // Get merchant settings for business hours
    const { data: settings, error: settingsError } = await supabase
      .from('merchant_settings')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();
      
    if (settingsError) {
      console.error('Error fetching merchant settings:', settingsError);
      // Default hours if settings not found
      return getAvailableSlotsWithWorkersInRange(
        merchantId, 
        date, 
        '09:00', 
        '17:00', 
        serviceDuration, 
        interval
      );
    }
    
    return getAvailableSlotsWithWorkersInRange(
      merchantId,
      date,
      settings.working_hours_start,
      settings.working_hours_end,
      serviceDuration,
      interval
    );
  } catch (error) {
    console.error('Error getting available slots with workers:', error);
    throw error;
  }
};

/**
 * Helper function to get available slots within a time range
 */
async function getAvailableSlotsWithWorkersInRange(
  merchantId: string,
  date: string,
  startHour: string,
  endHour: string,
  serviceDuration: number,
  interval: number
): Promise<Array<{time: string, availableWorkers: WorkerAvailability[]}>> {
  try {
    // Get all active workers
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);
      
    if (workersError) throw workersError;
    
    if (!workers || workers.length === 0) {
      return [];
    }
    
    // Create time slots at specified intervals
    const startTime = new Date(`${date}T${startHour}`);
    const endTime = new Date(`${date}T${endHour}`);
    const currentTime = new Date();
    const availableSlots = [];
    
    // Generate all possible time slots
    for (
      let slotTime = new Date(startTime);
      slotTime < endTime;
      slotTime = addMinutes(slotTime, interval)
    ) {
      // Skip slots in the past
      if (slotTime < currentTime && date === format(currentTime, 'yyyy-MM-dd')) {
        continue;
      }
      
      const slotTimeStr = format(slotTime, 'HH:mm');
      const slotEndTime = format(addMinutes(slotTime, serviceDuration), 'HH:mm');
      
      // For each time slot, find available workers
      const availableWorkersForSlot: WorkerAvailability[] = [];
      
      for (const worker of workers) {
        const isAvailable = await isWorkerAvailableForSlot(
          worker.id,
          date,
          slotTimeStr,
          slotEndTime
        );
        
        if (isAvailable) {
          availableWorkersForSlot.push({
            workerId: worker.id,
            name: worker.name,
            nextAvailableTime: slotEndTime,
            specialty: worker.specialty
          });
        }
      }
      
      // Only add slots with available workers
      if (availableWorkersForSlot.length > 0) {
        availableSlots.push({
          time: slotTimeStr,
          availableWorkers: availableWorkersForSlot
        });
      }
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots in range:', error);
    throw error;
  }
}

/**
 * Update slot booking status and assign worker
 */
export const bookSlotWithWorker = async (
  slotId: string,
  serviceName: string,
  serviceDuration: number,
  servicePrice: number,
  merchantId: string,
  date: string,
  startTime: string
): Promise<{success: boolean, workerId?: string, workerName?: string}> => {
  try {
    // First check if the slot is still available
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('*')
      .eq('id', slotId)
      .single();
      
    if (slotError) throw slotError;
    
    if (slot.is_booked) {
      // If slot is already booked, find an available worker
      const availableWorker = await findAvailableWorker(
        merchantId,
        date,
        startTime,
        serviceDuration
      );
      
      if (!availableWorker) {
        return { success: false };
      }
      
      // Calculate end time
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = addMinutes(startDateTime, serviceDuration);
      const endTime = format(endDateTime, 'HH:mm');
      
      // Create a new slot with the available worker
      const { data: newSlot, error: createError } = await supabase
        .from('slots')
        .insert({
          merchant_id: merchantId,
          date,
          start_time: startTime,
          end_time: endTime,
          worker_id: availableWorker.workerId,
          service_name: serviceName,
          service_price: servicePrice,
          service_duration: serviceDuration,
          is_booked: true
        })
        .select('id')
        .single();
        
      if (createError) throw createError;
      
      return {
        success: true,
        workerId: availableWorker.workerId,
        workerName: availableWorker.name
      };
    } else {
      // Update the existing slot
      const { error: updateError } = await supabase
        .from('slots')
        .update({
          is_booked: true,
          service_name: serviceName,
          service_price: servicePrice,
          service_duration: serviceDuration
        })
        .eq('id', slotId);
        
      if (updateError) throw updateError;
      
      // Get the worker's name
      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .select('name')
        .eq('id', slot.worker_id)
        .single();
        
      if (workerError) throw workerError;
      
      return {
        success: true,
        workerId: slot.worker_id,
        workerName: worker.name
      };
    }
  } catch (error) {
    console.error('Error booking slot with worker:', error);
    throw error;
  }
};
