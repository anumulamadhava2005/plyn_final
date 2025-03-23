
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';

type AppointmentData = {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

type AppointmentsListProps = {
  appointments: AppointmentData[];
  onUpdateStatus: (id: string, status: string) => void;
};

export const AppointmentsList = ({ appointments, onUpdateStatus }: AppointmentsListProps) => {
  const todayAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date === today;
  });
  
  const upcomingAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date > today;
  });

  const renderAppointment = (appointment: AppointmentData) => {
    const firstLetter = appointment.customerName.charAt(0).toUpperCase();
    
    return (
      <Card key={appointment.id} className="mb-4 bg-black/60 border-border/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium">
              {firstLetter}
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-medium">{appointment.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.service}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{format(new Date(appointment.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground ml-3">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{appointment.time} · {appointment.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Badge variant={
                  appointment.status === 'confirmed' ? 'default' :
                  appointment.status === 'pending' ? 'outline' : 'destructive'
                }>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
                
                <div className="flex gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500/10"
                        onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                        onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                      onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="bg-black/80 border-border/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Appointments</CardTitle>
        <Button variant="link" className="text-primary p-0">View All</Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
          <TabsList className="mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No appointments for today</p>
              </div>
            ) : (
              todayAppointments.map(renderAppointment)
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.map(renderAppointment)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
