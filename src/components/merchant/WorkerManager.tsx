
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { Plus, X, Loader2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchMerchantWorkers, createDefaultWorkers } from '@/utils/workerUtils';

interface WorkerData {
  id: string;
  name: string;
  specialty?: string;
  is_active: boolean;
}

interface WorkerManagerProps {
  merchantId: string;
  onWorkersUpdated?: () => void;
}

const WorkerManager: React.FC<WorkerManagerProps> = ({ merchantId, onWorkersUpdated }) => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerSpecialty, setNewWorkerSpecialty] = useState('');
  const { toast } = useToast();

  // Fetch workers on component mount
  useEffect(() => {
    loadWorkers();
  }, [merchantId]);

  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMerchantWorkers(merchantId);
      setWorkers(data);
    } catch (error: any) {
      toast({
        title: "Error loading workers",
        description: error.message || "Failed to load workers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWorker = async () => {
    if (!newWorkerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for the worker",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("workers")
        .insert({
          merchant_id: merchantId,
          name: newWorkerName,
          specialty: newWorkerSpecialty || null,
          is_active: true
        })
        .select();

      if (error) throw error;

      toast({
        title: "Worker Added",
        description: `${newWorkerName} has been added successfully`,
      });

      // Reset form
      setNewWorkerName('');
      setNewWorkerSpecialty('');
      
      // Reload workers
      loadWorkers();
      
      // Notify parent if callback provided
      if (onWorkersUpdated) {
        onWorkersUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error adding worker",
        description: error.message || "Failed to add worker",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (workerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("workers")
        .update({ is_active: !currentStatus })
        .eq("id", workerId);

      if (error) throw error;

      // Update local state
      setWorkers(workers.map(worker => 
        worker.id === workerId 
          ? { ...worker, is_active: !currentStatus } 
          : worker
      ));
      
      toast({
        title: "Worker Updated",
        description: `Worker status has been updated`,
      });
      
      // Notify parent if callback provided
      if (onWorkersUpdated) {
        onWorkersUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error updating worker",
        description: error.message || "Failed to update worker status",
        variant: "destructive",
      });
    }
  };

  const handleCreateDefaultWorkers = async () => {
    try {
      setIsSubmitting(true);
      await createDefaultWorkers(merchantId, 4); // Create 4 default workers
      toast({
        title: "Default Workers Created",
        description: "4 default workers have been created",
      });
      loadWorkers();
      
      // Notify parent if callback provided
      if (onWorkersUpdated) {
        onWorkersUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error creating workers",
        description: error.message || "Failed to create default workers",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-black/80 border-border/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Manage Workers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {workers.length === 0 ? (
              <div className="text-center py-6 bg-muted/20 rounded-md">
                <p className="text-muted-foreground mb-4">No workers added yet</p>
                <Button onClick={handleCreateDefaultWorkers} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create Default Workers
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {workers.map((worker) => (
                  <div key={worker.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      {worker.specialty && (
                        <p className="text-sm text-muted-foreground">Specialty: {worker.specialty}</p>
                      )}
                    </div>
                    <Toggle
                      pressed={worker.is_active}
                      onPressedChange={() => handleToggleActive(worker.id, worker.is_active)}
                      aria-label="Toggle active status"
                      className={worker.is_active ? "bg-green-500/30" : "bg-red-500/30"}
                    >
                      {worker.is_active ? "Active" : "Inactive"}
                    </Toggle>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-border/20">
              <h3 className="text-sm font-medium mb-2">Add New Worker</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="workerName">Name</Label>
                  <Input
                    id="workerName"
                    value={newWorkerName}
                    onChange={(e) => setNewWorkerName(e.target.value)}
                    placeholder="Enter worker name"
                  />
                </div>
                <div>
                  <Label htmlFor="workerSpecialty">Specialty (optional)</Label>
                  <Input
                    id="workerSpecialty"
                    value={newWorkerSpecialty}
                    onChange={(e) => setNewWorkerSpecialty(e.target.value)}
                    placeholder="E.g., Hair Coloring, Beard Trim"
                  />
                </div>
                <Button 
                  onClick={handleAddWorker} 
                  disabled={isSubmitting || !newWorkerName.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Worker
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkerManager;
