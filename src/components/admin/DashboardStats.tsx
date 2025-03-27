
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CircleUser, Briefcase, CalendarDays, ClipboardList } from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '@/types/admin';

type DashboardStatsProps = {
  totalMerchants: number;
  totalUsers: number;
  totalBookings: number;
  pendingApplications: number;
  rejectedApplications?: number;
  totalServices?: number;
  totalRevenue?: number;
};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalMerchants,
  totalUsers,
  totalBookings,
  pendingApplications,
  rejectedApplications = 0,
  totalServices = 0,
  totalRevenue = 0
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        icon={<CircleUser className="h-12 w-12 text-blue-500" />}
        title="Total Users"
        value={totalUsers}
        trend={"+5%"}
        trendDirection="up"
      />
      
      <StatCard 
        icon={<Briefcase className="h-12 w-12 text-green-500" />}
        title="Active Merchants"
        value={totalMerchants}
        trend={"+2%"}
        trendDirection="up"
      />
      
      <StatCard 
        icon={<CalendarDays className="h-12 w-12 text-indigo-500" />}
        title="Total Bookings"
        value={totalBookings}
        trend={"+12%"}
        trendDirection="up"
      />
      
      <StatCard 
        icon={<ClipboardList className="h-12 w-12 text-orange-500" />}
        title="Pending Applications"
        value={pendingApplications}
        badge={pendingApplications > 0}
      />
    </div>
  );
};

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  badge?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  trend, 
  trendDirection = 'up',
  badge = false
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
            
            {trend && (
              <p className={`mt-1 text-xs ${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend} from last month
              </p>
            )}
          </div>
          
          <div className="relative">
            {icon}
            {badge && value > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {value}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStats;
