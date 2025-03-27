
export type UserProfile = {
  username: string | null;
  email: string | null;
};

export type MerchantApplication = {
  id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_profile: UserProfile | null;
};

export type DashboardStats = {
  totalMerchants: number;
  totalUsers: number;
  totalBookings: number;
  pendingApplications: number;
};

export type MerchantData = {
  id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
  status: string;
  created_at: string;
};

export type BookingStats = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
};

export type RevenueData = {
  period: string;
  amount: number;
};

export type ServiceDistribution = {
  name: string;
  value: number;
};
