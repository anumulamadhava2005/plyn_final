
// Utility functions for storing and retrieving booking data

/**
 * Saves booking data to session storage
 */
export const saveBookingData = (bookingData: any): void => {
  try {
    if (!bookingData) {
      console.error("Cannot save empty booking data");
      return;
    }
    
    // Ensure required fields exist
    if (!bookingData.salonId || !bookingData.salonName || !bookingData.date || !bookingData.timeSlot) {
      console.error("Missing required booking data fields");
      return;
    }
    
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    console.log("Booking data saved to session storage:", bookingData);
  } catch (error) {
    console.error("Error saving booking data to session storage:", error);
  }
};

/**
 * Retrieves booking data from session storage
 */
export const getBookingData = (): any | null => {
  try {
    const storedData = sessionStorage.getItem('bookingData');
    if (!storedData) {
      return null;
    }
    
    const bookingData = JSON.parse(storedData);
    console.log("Retrieved booking data from session storage:", bookingData);
    return bookingData;
  } catch (error) {
    console.error("Error retrieving booking data from session storage:", error);
    return null;
  }
};

/**
 * Clears booking data from session storage
 */
export const clearBookingData = (): void => {
  try {
    sessionStorage.removeItem('bookingData');
    console.log("Booking data cleared from session storage");
  } catch (error) {
    console.error("Error clearing booking data from session storage:", error);
  }
};

/**
 * Validates if booking data contains all required fields
 */
export const validateBookingData = (data: any): boolean => {
  if (!data) return false;
  
  const requiredFields = [
    'salonId', 
    'salonName', 
    'services', 
    'date', 
    'timeSlot', 
    'totalPrice', 
    'totalDuration'
  ];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Booking data missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate services is an array with at least one service
  if (!Array.isArray(data.services) || data.services.length === 0) {
    console.error('Booking data missing services array or empty services');
    return false;
  }
  
  return true;
};
