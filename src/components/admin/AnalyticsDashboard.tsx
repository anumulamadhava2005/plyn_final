
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, BarChart3, PieChart, LineChart, Users, CalendarDays, Store } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { DashboardStats } from '@/types/admin';

// Sample colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch total bookings and merchants data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Get total merchants count
      const { count: merchantCount, error: merchantError } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true });
      
      if (merchantError) throw merchantError;
      
      // Get total users count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Get total bookings count
      const { count: bookingCount, error: bookingError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      if (bookingError) throw bookingError;
      
      // Get pending applications count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      const dashboardStats: DashboardStats = {
        totalMerchants: merchantCount || 0,
        totalUsers: userCount || 0,
        totalBookings: bookingCount || 0,
        pendingApplications: pendingCount || 0
      };
      
      return dashboardStats;
    }
  });
  
  // Mock data for merchant distribution by service category
  const serviceDistributionData = [
    { name: 'Hair', value: 42 },
    { name: 'Nails', value: 28 },
    { name: 'Skin', value: 15 },
    { name: 'Makeup', value: 10 },
    { name: 'Spa', value: 5 },
  ];
  
  // Mock data for bookings trend
  const bookingsTrendData = [
    { name: 'Jan', bookings: 12 },
    { name: 'Feb', bookings: 19 },
    { name: 'Mar', bookings: 25 },
    { name: 'Apr', bookings: 32 },
    { name: 'May', bookings: 38 },
    { name: 'Jun', bookings: 42 },
  ];
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Analytics</CardTitle>
        <CardDescription>
          Overview of platform performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="merchants">Merchant Analytics</TabsTrigger>
            <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{stats?.totalMerchants || 0}</h3>
                    <p className="text-sm text-muted-foreground">Total Merchants</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{stats?.totalBookings || 0}</h3>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Growth Trend</CardTitle>
                <CardDescription>Monthly booking statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={bookingsTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#8884d8" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="merchants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Distribution by Service</CardTitle>
                <CardDescription>Distribution of merchants by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={serviceDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Distribution by Service</CardTitle>
                <CardDescription>Most popular services by booking count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart
                      data={[
                        { name: 'Haircut', bookings: 45 },
                        { name: 'Coloring', bookings: 32 },
                        { name: 'Styling', bookings: 28 },
                        { name: 'Treatment', bookings: 22 },
                        { name: 'Extensions', bookings: 15 },
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#82ca9d" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
