
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
