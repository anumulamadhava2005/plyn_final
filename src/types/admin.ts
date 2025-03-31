
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
  totalMerchants: number;
  totalUsers: number;
  totalBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  completedBookings: number;
  pendingBookings: number;
  pendingApplications: number;
}

export interface MerchantApplication {
  id: string;
  business_name: string;
  status: string;
  created_at: string;
  business_email: string;
  business_phone: string;
  business_address?: string;
  service_category?: string;
}

export interface MerchantData {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  service_category: string;
  status: string;
  created_at: string;
}
