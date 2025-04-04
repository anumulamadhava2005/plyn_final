
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Worker } from '@/types/admin';

interface Appointment {
  id: string;
  booking_date: string;
  time_slot: string;
  end_time: string;
  service_name: string;
  service_duration: number;
  customer_name: string;
  status: string;
}

interface ReallocationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedAppointment: Appointment | null;
  workers: Worker[];
  confirmDialogOpen: boolean;
  setConfirmDialogOpen: (open: boolean) => void;
  reallocateLoading: boolean;
  confirmReallocate: (workerId: string) => void;
  executeReallocate: () => Promise<void>;
  currentWorkerId: string;
}

const ReallocationDialog: React.FC<ReallocationDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedAppointment,
  workers,
  confirmDialogOpen,
  setConfirmDialogOpen,
  reallocateLoading,
  confirmReallocate,
  executeReallocate,
  currentWorkerId
}) => {
  return (
    <>
      {/* Reallocate Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reallocate Appointment</DialogTitle>
            <DialogDescription>
              Select a worker to reassign this appointment to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Appointment Details:</h4>
              {selectedAppointment && (
                <div className="text-sm">
                  <p><span className="font-medium">Time:</span> {selectedAppointment.time_slot} - {selectedAppointment.end_time}</p>
                  <p><span className="font-medium">Service:</span> {selectedAppointment.service_name}</p>
                  <p><span className="font-medium">Client:</span> {selectedAppointment.customer_name}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Select a worker:</h4>
              <div className="grid grid-cols-2 gap-2">
                {workers.map(worker => (
                  <Button 
                    key={worker.id} 
                    variant="outline" 
                    onClick={() => confirmReallocate(worker.id)}
                    className="justify-start"
                  >
                    {worker.name}
                    {worker.specialty && (
                      <span className="text-xs text-muted-foreground ml-2">({worker.specialty})</span>
                    )}
                  </Button>
                ))}
              </div>
              {workers.length === 0 && (
                <p className="text-sm text-muted-foreground">No other workers available to reallocate to.</p>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Reallocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reassign this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeReallocate} 
              disabled={reallocateLoading}
            >
              {reallocateLoading ? 'Reallocating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReallocationDialog;
