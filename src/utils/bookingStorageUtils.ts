
// Utility functions for storing and retrieving booking data
import { BookingFormData } from "@/types/merchant";

/**
 * Saves booking data to session storage with type safety
 */
export const saveBookingData = (bookingData: BookingFormData): void => {
  try {
    if (!bookingData) {
      console.error("Cannot save empty booking data");
      return;
    }
    
    // Ensure required fields exist
    if (!bookingData.salonId || !bookingData.salonName || !bookingData.date || !bookingData.timeSlot) {
      console.error("Missing required booking data fields", bookingData);
      return;
    }
    
    // Convert date to string if it's a Date object
    const processedData = {
      ...bookingData,
      date: bookingData.date instanceof Date 
        ? bookingData.date.toISOString() 
        : bookingData.date
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(processedData));
    console.log("Booking data saved to session storage:", processedData);
  } catch (error) {
    console.error("Error saving booking data to session storage:", error);
  }
};

/**
 * Retrieves booking data from session storage with type safety
 */
export const getBookingData = (): BookingFormData | null => {
  try {
    const storedData = sessionStorage.getItem('bookingData');
    if (!storedData) {
      console.log("No booking data found in session storage");
      return null;
    }
    
    const bookingData = JSON.parse(storedData) as BookingFormData;
    console.log("Retrieved booking data from session storage:", bookingData);
    
    // Validate essential data
    if (!validateBookingData(bookingData)) {
      console.error("Retrieved booking data is invalid");
      return null;
    }
    
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
  if (!data) {
    console.error("Booking data is null or undefined");
    return false;
  }
  
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
