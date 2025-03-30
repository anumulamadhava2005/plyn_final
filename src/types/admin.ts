

export interface TimeSlot {
  id: string;
  merchant_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  service_duration: number;
}

export interface SlotAvailability {
  date: string;
  slots: {
    available: number;
    booked: number;
  };
}

export interface DisplaySlot {
  id: string;
  day: string;
  time: string;
  status: 'available' | 'booked' | 'unavailable';
}

export interface SlotFormData {
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'cancelled' | 'pending';
}

export interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  completedBookings: number;
  pendingBookings: number;
}

export interface MerchantApplication {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  status: string;
  createdAt: string;
}

export interface MerchantData {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  serviceCategory: string;
  status: string;
}

