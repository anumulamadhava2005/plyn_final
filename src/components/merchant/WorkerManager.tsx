
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, UserPlus, Edit, Trash, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { WorkerData } from '@/types/admin';
import { fetchMerchantWorkers } from '@/utils/workerUtils';

interface WorkerManagerProps {
  merchantId: string;
  onWorkersUpdated?: () => void;
}

const WorkerManager: React.FC<WorkerManagerProps> = ({ merchantId, onWorkersUpdated }) => {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    notes: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadWorkers();
  }, [merchantId]);

  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMerchantWorkers(merchantId);
      setWorkers(data);
    } catch (error: any) {
      console.error('Error loading workers:', error);
      toast({
        title: "Failed to load workers",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      notes: '',
      is_active: true
    });
    setEditingWorker(null);
  };

  const handleEditWorker = (worker: WorkerData) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      specialty: worker.specialty || '',
      notes: worker.notes || '',
      is_active: worker.is_active
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Worker name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingWorker) {
        // Update existing worker
        const { data, error } = await supabase
          .from("workers")
          .update({
            name: formData.name,
            specialty: formData.specialty || null,
            notes: formData.notes || null,
            is_active: formData.is_active
          })
          .eq("id", editingWorker.id)
          .select();

        if (error) throw error;

        toast({
          title: "Worker Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        // Create new worker
        const { data, error } = await supabase
          .from("workers")
          .insert({
            merchant_id: merchantId,
            name: formData.name,
            specialty: formData.specialty || null,
            notes: formData.notes || null,
            is_active: formData.is_active
          })
          .select();

        if (error) throw error;

        toast({
          title: "Worker Added",
          description: `${formData.name} has been added successfully`,
        });
      }

      // Refresh workers list
      loadWorkers();
      
      // Notify parent component
      if (onWorkersUpdated) {
        onWorkersUpdated();
      }
      
      // Reset the form
      resetForm();
    } catch (error: any) {
      console.error('Error saving worker:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save worker",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!confirm(`Are you sure you want to delete ${workerName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("workers")
        .delete()
        .eq("id", workerId);

      if (error) throw error;

      toast({
        title: "Worker Deleted",
        description: `${workerName} has been deleted successfully`,
      });

      // Refresh workers list
      loadWorkers();
      
      // Notify parent component
      if (onWorkersUpdated) {
        onWorkersUpdated();
      }
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete worker",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/80 border-border/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            {editingWorker ? 'Edit Worker' : 'Add New Worker'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Worker Name</Label>
            <Input
              id="name"
              placeholder="Enter worker name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="specialty">Specialty (Optional)</Label>
            <Input
              id="specialty"
              placeholder="e.g., Beard Trim, Hair Color, etc."
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about this worker"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active Status</Label>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingWorker ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingWorker ? 'Update Worker' : 'Add Worker'
              )}
            </Button>
            {editingWorker && (
              <Button 
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/80 border-border/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Manage Workers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workers.length > 0 ? (
            <div className="space-y-4">
              {workers.map((worker) => (
                <div 
                  key={worker.id} 
                  className={`p-4 rounded-md flex justify-between items-center border ${
                    worker.is_active 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/20 border-muted/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium">{worker.name}</h3>
                      {!worker.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-muted/30 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    {worker.specialty && (
                      <p className="text-sm text-muted-foreground">
                        Specialty: {worker.specialty}
                      </p>
                    )}
                    {worker.notes && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        {worker.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditWorker(worker)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteWorker(worker.id, worker.name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No workers found. Add your first worker above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerManager;
