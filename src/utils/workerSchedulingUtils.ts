
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes, parseISO, isPast } from 'date-fns';
import { WorkerAvailability } from '@/types/admin';

// Cache for worker availability results
const workerAvailabilityCache = new Map<string, {
  timestamp: number;
  workers: WorkerAvailability[];
}>();

// Cache for available slots with workers
const availableSlotsCache = new Map<string, {
  timestamp: number;
  slots: Array<{
    time: string; 
    availableWorkers: Array<{
      workerId: string;
      name: string;
      nextAvailableTime: string;
      specialty?: string;
    }>;
  }>;
}>();

// Find an available worker for a specific time slot
export const findAvailableWorker = async (
  merchantId: string,
  date: string,
  time: string,
  duration: number = 30
): Promise<WorkerAvailability | null> => {
  try {
    // Create a cache key
    const cacheKey = `worker_${merchantId}_${date}_${time}_${duration}`;
    const cacheExpiry = 30 * 1000; // 30 seconds
    
    // Check cache first
    const cached = workerAvailabilityCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < cacheExpiry)) {
      return cached.workers.length > 0 ? cached.workers[0] : null;
    }
    
    // Get all available workers for this time slot
    const availableWorkers = await getAvailableWorkers(merchantId, date, time, duration);
    
    // Update cache
    workerAvailabilityCache.set(cacheKey, {
      timestamp: Date.now(),
      workers: availableWorkers
    });
    
    // Return the first available worker, or null if none are available
    return availableWorkers.length > 0 ? availableWorkers[0] : null;
  } catch (error) {
    console.error("Error finding available worker:", error);
    return null;
  }
};

// Get available workers for a specific time
export const getAvailableWorkers = async (
  merchantId: string,
  date: string,
  time: string,
  duration: number = 30
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
    
    // Check if the slot is in the past
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    
    if (isPast(slotDate)) {
      return []; // Don't return workers for past slots
    }
    
    // Fetch all unavailability and bookings for all workers in batch queries
    const [unavailabilityResult, bookingsResult] = await Promise.all([
      // Get all worker unavailability for this date
      supabase
        .from('worker_unavailability')
        .select('*')
        .eq('date', date)
        .in('worker_id', workers.map(w => w.id)),
      
      // Get all booked slots for this date and time
      supabase
        .from('slots')
        .select('*')
        .eq('date', date)
        .eq('start_time', time)
        .eq('is_booked', true)
        .in('worker_id', workers.map(w => w.id))
    ]);
    
    const { data: unavailabilities } = unavailabilityResult;
    const { data: bookings } = bookingsResult;
    
    // Create lookup maps for quick checking
    const unavailabilityMap: Record<string, Array<{start: string, end: string}>> = {};
    const bookedMap: Record<string, boolean> = {};
    
    // Process unavailabilities
    if (unavailabilities && unavailabilities.length > 0) {
      unavailabilities.forEach(unavail => {
        if (!unavailabilityMap[unavail.worker_id]) {
          unavailabilityMap[unavail.worker_id] = [];
        }
        unavailabilityMap[unavail.worker_id].push({
          start: unavail.start_time,
          end: unavail.end_time
        });
      });
    }
    
    // Process bookings
    if (bookings && bookings.length > 0) {
      bookings.forEach(booking => {
        bookedMap[booking.worker_id] = true;
      });
    }
    
    // Process each worker to check availability
    const availableWorkers = workers.filter(worker => {
      // Check if worker is already booked
      if (bookedMap[worker.id]) {
        return false;
      }
      
      // Check for unavailabilities
      const workerUnavailabilities = unavailabilityMap[worker.id] || [];
      
      // Parse time to check against unavailabilities
      const slotTime = hours * 60 + minutes; // Convert to minutes since midnight
      const slotEndTime = slotTime + duration;
      
      // Check if any unavailability period overlaps with this slot
      const isUnavailable = workerUnavailabilities.some(period => {
        const [startHour, startMinute] = period.start.split(':').map(Number);
        const [endHour, endMinute] = period.end.split(':').map(Number);
        
        const periodStartTime = startHour * 60 + startMinute;
        const periodEndTime = endHour * 60 + endMinute;
        
        // Check for overlap
        return (slotTime < periodEndTime && slotEndTime > periodStartTime);
      });
      
      return !isUnavailable;
    }).map(worker => ({
      workerId: worker.id,
      name: worker.name,
      nextAvailableTime: time,
      specialty: worker.specialty
    }));
    
    return availableWorkers;
  } catch (error) {
    console.error("Error getting available workers:", error);
    throw new Error("Could not check worker availability");
  }
};

// Helper function to check if a worker is available for a specific slot
// This is optimized to avoid repeated database queries
export const isWorkerAvailableForSlot = async (
  workerId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  try {
    const [unavailabilityResult, bookingsResult] = await Promise.all([
      // Check if worker has any unavailability for this date
      supabase
        .from('worker_unavailability')
        .select('*')
        .eq('worker_id', workerId)
        .eq('date', date),
      
      // Check if worker already has a booking at this time
      supabase
        .from('slots')
        .select('*')
        .eq('worker_id', workerId)
        .eq('date', date)
        .eq('start_time', startTime)
        .eq('is_booked', true)
    ]);
    
    const { data: unavailability } = unavailabilityResult;
    const { data: bookings } = bookingsResult;
    
    // If there are bookings at this time, worker is not available
    if (bookings && bookings.length > 0) {
      return false;
    }
    
    // Check if there's unavailability that overlaps with this time slot
    if (unavailability && unavailability.length > 0) {
      // Parse times to compare
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      const slotStartMinutes = startHour * 60 + startMinute;
      const slotEndMinutes = endHour * 60 + endMinute;
      
      // Check each unavailability period
      for (const period of unavailability) {
        const [unavailStartHour, unavailStartMinute] = period.start_time.split(':').map(Number);
        const [unavailEndHour, unavailEndMinute] = period.end_time.split(':').map(Number);
        
        const unavailStartMinutes = unavailStartHour * 60 + unavailStartMinute;
        const unavailEndMinutes = unavailEndHour * 60 + unavailEndMinute;
        
        // Check for overlap
        if (slotStartMinutes < unavailEndMinutes && slotEndMinutes > unavailStartMinutes) {
          return false; // Overlap found, worker is not available
        }
      }
    }
    
    return true; // No conflicts found, worker is available
  } catch (error) {
    console.error('Error checking worker availability:', error);
    return false;
  }
};

// Get available slots with workers for a specific date - optimized version
export const getAvailableSlotsWithWorkers = async (
  merchantId: string, 
  date: string,
  serviceDuration: number = 30
): Promise<Array<{
  time: string; 
  availableWorkers: Array<{
    workerId: string;
    name: string;
    nextAvailableTime: string;
    specialty?: string;
  }>;
}>> => {
  // Create a cache key
  const cacheKey = `slots_${merchantId}_${date}_${serviceDuration}`;
  const cacheExpiry = 15 * 1000; // 15 seconds - reduced for more frequent updates
  
  // Check cache first
  const cached = availableSlotsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < cacheExpiry)) {
    return cached.slots;
  }
  
  try {
    // Get merchant settings to determine working hours
    const { data: settings } = await supabase
      .from('merchant_settings')
      .select('working_hours_start, working_hours_end')
      .eq('merchant_id', merchantId)
      .single();
    
    // Default working hours if not set
    const startTime = settings?.working_hours_start || '09:00:00';
    const endTime = settings?.working_hours_end || '17:00:00';
    
    // Generate time slots based on working hours
    const slots: string[] = [];
    let currentTime = new Date(`2000-01-01T${startTime}`);
    const endTimeDate = new Date(`2000-01-01T${endTime}`);
    
    while (currentTime < endTimeDate) {
      slots.push(format(currentTime, 'HH:mm'));
      currentTime = addMinutes(currentTime, 30); // 30-minute intervals
    }
    
    // Get all active workers for this merchant
    const { data: workers } = await supabase
      .from('workers')
      .select('id, name, specialty')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);
    
    if (!workers || workers.length === 0) {
      // No workers available
      const result: Array<{ time: string; availableWorkers: [] }> = [];
      return result;
    }
    
    // Fetch all relevant data in parallel batches
    const [bookedSlotsResult, unavailabilityResult] = await Promise.all([
      // Get booked slots for this date in a single query
      supabase
        .from('slots')
        .select('start_time, worker_id')
        .eq('merchant_id', merchantId)
        .eq('date', date)
        .eq('is_booked', true),
      
      // Get worker unavailability for this date in a single query
      supabase
        .from('worker_unavailability')
        .select('worker_id, start_time, end_time')
        .eq('date', date)
        .in('worker_id', workers.map(w => w.id))
    ]);
    
    const { data: bookedSlots } = bookedSlotsResult;
    const { data: unavailability } = unavailabilityResult;
    
    // Create a map of booked slots by worker and time
    const bookedSlotMap: Record<string, Set<string>> = {};
    (bookedSlots || []).forEach(slot => {
      if (!bookedSlotMap[slot.worker_id]) {
        bookedSlotMap[slot.worker_id] = new Set();
      }
      bookedSlotMap[slot.worker_id].add(slot.start_time);
    });
    
    // Create a map of unavailable times by worker
    const unavailableMap: Record<string, Array<{start: number, end: number}>> = {};
    (unavailability || []).forEach(block => {
      if (!unavailableMap[block.worker_id]) {
        unavailableMap[block.worker_id] = [];
      }
      
      // Convert time strings to minutes for easier comparison
      const [startHour, startMinute] = block.start_time.split(':').map(Number);
      const [endHour, endMinute] = block.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      unavailableMap[block.worker_id].push({
        start: startMinutes,
        end: endMinutes
      });
    });
    
    // Check if any slots are in the past
    const currentDate = new Date();
    const isToday = date === format(currentDate, 'yyyy-MM-dd');
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    
    // Process each time slot to find available workers
    const availableSlots = slots.map(time => {
      const [hour, minute] = time.split(':').map(Number);
      
      // Skip slots in the past for today
      if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
        return {
          time,
          availableWorkers: []
        };
      }
      
      // Convert time to minutes for comparison
      const slotMinutes = hour * 60 + minute;
      const slotEndMinutes = slotMinutes + serviceDuration;
      
      // Find available workers for this time slot
      const availableWorkersForSlot = workers.filter(worker => {
        // Check if worker is booked at this time
        if (bookedSlotMap[worker.id]?.has(time)) {
          return false;
        }
        
        // Check if worker has unavailability that overlaps with this time
        const workerUnavailability = unavailableMap[worker.id] || [];
        const isUnavailable = workerUnavailability.some(block => {
          return (slotMinutes < block.end && slotEndMinutes > block.start);
        });
        
        return !isUnavailable;
      });
      
      return {
        time,
        availableWorkers: availableWorkersForSlot.map(worker => ({
          workerId: worker.id,
          name: worker.name,
          nextAvailableTime: time,
          specialty: worker.specialty
        }))
      };
    }).filter(slot => slot.availableWorkers.length > 0);
    
    // Update cache
    availableSlotsCache.set(cacheKey, {
      timestamp: Date.now(),
      slots: availableSlots
    });
    
    return availableSlots;
  } catch (error) {
    console.error("Error getting available slots with workers:", error);
    return [];
  }
};

// Optimized function for getting slots within a specific time range
export const getAvailableSlotsWithWorkersInRange = async (
  merchantId: string,
  date: string,
  startHour: string,
  endHour: string,
  serviceDuration: number = 30,
  interval: number = 30
): Promise<Array<{
  time: string; 
  availableWorkers: Array<{
    workerId: string;
    name: string;
    nextAvailableTime: string;
    specialty?: string;
  }>;
}>> => {
  // Create a cache key for this specific range request
  const cacheKey = `range_${merchantId}_${date}_${startHour}_${endHour}_${serviceDuration}_${interval}`;
  const cacheExpiry = 30 * 1000; // 30 seconds
  
  // Check cache first
  const cached = availableSlotsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < cacheExpiry)) {
    return cached.slots;
  }
  
  try {
    // Get all active workers for this merchant
    const { data: workers, error: workersError } = await supabase
      .from('workers')
      .select('id, name, specialty')
      .eq('merchant_id', merchantId)
      .eq('is_active', true);
      
    if (workersError) throw workersError;
    
    if (!workers || workers.length === 0) {
      return [];
    }
    
    // Create time slots at specified intervals
    const startTimeDate = new Date(`${date}T${startHour}`);
    const endTimeDate = new Date(`${date}T${endHour}`);
    const currentTimeNow = new Date();
    
    // Generate all possible time slots first
    const timeSlots: string[] = [];
    for (
      let slotTime = new Date(startTimeDate);
      slotTime < endTimeDate;
      slotTime = addMinutes(slotTime, interval)
    ) {
      const slotTimeStr = format(slotTime, 'HH:mm');
      timeSlots.push(slotTimeStr);
    }
    
    // Fetch all booked slots and unavailability for this date in parallel
    const [bookedSlotsResult, unavailabilityResult] = await Promise.all([
      supabase
        .from('slots')
        .select('start_time, worker_id')
        .eq('merchant_id', merchantId)
        .eq('date', date)
        .eq('is_booked', true),
      
      supabase
        .from('worker_unavailability')
        .select('worker_id, start_time, end_time')
        .eq('date', date)
        .in('worker_id', workers.map(w => w.id))
    ]);
    
    const { data: bookedSlots } = bookedSlotsResult;
    const { data: unavailability } = unavailabilityResult;
    
    // Create lookup maps for quick checking
    const bookedSlotMap: Record<string, Set<string>> = {};
    (bookedSlots || []).forEach(slot => {
      if (!bookedSlotMap[slot.worker_id]) {
        bookedSlotMap[slot.worker_id] = new Set();
      }
      bookedSlotMap[slot.worker_id].add(slot.start_time);
    });
    
    const unavailableMap: Record<string, Array<{start: number, end: number}>> = {};
    (unavailability || []).forEach(block => {
      if (!unavailableMap[block.worker_id]) {
        unavailableMap[block.worker_id] = [];
      }
      
      // Convert time strings to minutes for easier comparison
      const [startHour, startMinute] = block.start_time.split(':').map(Number);
      const [endHour, endMinute] = block.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      unavailableMap[block.worker_id].push({
        start: startMinutes,
        end: endMinutes
      });
    });
    
    // Process all time slots at once
    const isToday = date === format(currentTimeNow, 'yyyy-MM-dd');
    const currentHour = currentTimeNow.getHours();
    const currentMinute = currentTimeNow.getMinutes();
    
    const availableSlots = timeSlots.map(timeStr => {
      const [hour, minute] = timeStr.split(':').map(Number);
      
      // Skip slots in the past for today
      if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
        return {
          time: timeStr,
          availableWorkers: []
        };
      }
      
      // Convert slot time to minutes for comparison
      const slotMinutes = hour * 60 + minute;
      const slotEndMinutes = slotMinutes + serviceDuration;
      
      // Find available workers for this time slot
      const availableWorkersForSlot = workers.filter(worker => {
        // Check if worker is booked at this time
        if (bookedSlotMap[worker.id]?.has(timeStr)) {
          return false;
        }
        
        // Check if worker has unavailability that overlaps with this time
        const workerUnavailability = unavailableMap[worker.id] || [];
        const isUnavailable = workerUnavailability.some(block => {
          return (slotMinutes < block.end && slotEndMinutes > block.start);
        });
        
        return !isUnavailable;
      }).map(worker => ({
        workerId: worker.id,
        name: worker.name,
        nextAvailableTime: timeStr,
        specialty: worker.specialty
      }));
      
      return {
        time: timeStr,
        availableWorkers: availableWorkersForSlot
      };
    }).filter(slot => slot.availableWorkers.length > 0);
    
    // Update cache
    availableSlotsCache.set(cacheKey, {
      timestamp: Date.now(),
      slots: availableSlots
    });
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots in range:', error);
    return [];
  }
};

// Function to clear the availability cache for a specific date and merchant
// This should be called when a booking is made to ensure fresh data
export const clearAvailabilityCache = (merchantId: string, date: string) => {
  // Clear all cache entries for this merchant and date
  const keysToDelete: string[] = [];
  
  // Find all cache keys related to this merchant and date
  availableSlotsCache.forEach((_, key) => {
    if (key.includes(`slots_${merchantId}_${date}`) || 
        key.includes(`range_${merchantId}_${date}`)) {
      keysToDelete.push(key);
    }
  });
  
  // Clear worker availability cache too
  workerAvailabilityCache.forEach((_, key) => {
    if (key.includes(`worker_${merchantId}_${date}`)) {
      keysToDelete.push(key);
    }
  });
  
  // Delete the found cache entries
  keysToDelete.forEach(key => {
    if (availableSlotsCache.has(key)) {
      availableSlotsCache.delete(key);
    }
    if (workerAvailabilityCache.has(key)) {
      workerAvailabilityCache.delete(key);
    }
  });
  
  console.log(`Cleared ${keysToDelete.length} cache entries for merchant ${merchantId} and date ${date}`);
};
