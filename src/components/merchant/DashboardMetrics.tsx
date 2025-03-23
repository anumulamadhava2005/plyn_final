
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  className?: string;
};

export const MetricCard = ({ title, value, icon, change, className }: MetricCardProps) => {
  return (
    <Card className={cn("overflow-hidden bg-black/70 border-border/20", className)}>
      <CardContent className="p-6 flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          {change && (
            <div className="flex items-center">
              {change.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : change.trend === 'down' ? (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              ) : null}
              <span className={cn(
                "text-xs",
                change.trend === 'up' ? "text-green-500" : 
                change.trend === 'down' ? "text-red-500" : ""
              )}>
                {change.value}% vs last week
              </span>
            </div>
          )}
        </div>
        <div className="rounded-full p-3 bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

type DashboardMetricsProps = {
  totalAppointments: number;
  todayAppointments: number;
  totalClients: number;
  availableSlots: number;
};

export const DashboardMetrics = ({
  totalAppointments,
  todayAppointments,
  totalClients,
  availableSlots
}: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Appointments"
        value={totalAppointments}
        icon={<Calendar className="w-5 h-5" />}
        change={{ value: 12, trend: 'up' }}
      />
      <MetricCard
        title="Today's Appointments"
        value={todayAppointments}
        icon={<Calendar className="w-5 h-5" />}
      />
      <MetricCard
        title="Total Clients"
        value={totalClients}
        icon={<Users className="w-5 h-5" />}
        change={{ value: 8, trend: 'up' }}
      />
      <MetricCard
        title="Available Slots"
        value={availableSlots}
        icon={<Clock className="w-5 h-5" />}
        change={{ value: 3, trend: 'down' }}
      />
    </div>
  );
};

export default DashboardMetrics;
