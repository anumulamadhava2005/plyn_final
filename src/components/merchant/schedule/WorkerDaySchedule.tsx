
import React from 'react';
import { format } from 'date-fns';
import { Clock, UserCheck2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useWorkerSchedule from '@/hooks/useWorkerSchedule';
import ReallocationDialog from './ReallocationDialog';
import { Worker } from '@/types/admin';

interface WorkerDayScheduleProps {
  workerId: string;
  worker: Worker;
  date: Date;
  merchantId: string;
  isActive: boolean;
  loading: boolean;
  allWorkers: Worker[];
}

const WorkerDaySchedule: React.FC<WorkerDayScheduleProps> = ({
  workerId,
  worker,
  date,
  merchantId,
  isActive,
  loading,
  allWorkers
}) => {
  const { 
    appointments, 
    isReallocateDialogOpen, 
    selectedAppointment,
    confirmDialogOpen,
    reallocateLoading,
    handleReallocate,
    confirmReallocate,
    executeReallocate,
    setIsReallocateDialogOpen,
    setConfirmDialogOpen
  } = useWorkerSchedule({
    workerId,
    date,
    merchantId
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  return (
    <>
      <TabsContent value={workerId} className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {worker.name}'s Schedule
              {worker.specialty && (
                <span className="text-sm text-muted-foreground ml-2">({worker.specialty})</span>
              )}
            </h3>
            <div className="text-sm text-muted-foreground">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading schedule...</div>
          ) : appointments?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments?.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {appointment.time_slot} - {appointment.end_time}
                      </div>
                    </TableCell>
                    <TableCell>{appointment.service_duration} mins</TableCell>
                    <TableCell>{appointment.service_name}</TableCell>
                    <TableCell>{appointment.customer_name}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleReallocate(appointment)}
                      >
                        <UserCheck2 className="h-3 w-3" /> 
                        Reallocate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No appointments scheduled for {worker.name} on this day.
            </div>
          )}
        </div>
      </TabsContent>
      
      <ReallocationDialog
        isOpen={isReallocateDialogOpen}
        setIsOpen={setIsReallocateDialogOpen}
        selectedAppointment={selectedAppointment}
        workers={allWorkers.filter(w => w.id !== workerId)}
        confirmDialogOpen={confirmDialogOpen}
        setConfirmDialogOpen={setConfirmDialogOpen}
        reallocateLoading={reallocateLoading}
        confirmReallocate={confirmReallocate}
        executeReallocate={executeReallocate}
        currentWorkerId={workerId}
      />
    </>
  );
};

export default WorkerDaySchedule;
