
import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface Step3Props {
  formData: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    salonType: string;
    description: string;
  };
  prevStep: () => void;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const Step3ReviewSubmit: React.FC<Step3Props> = ({ 
  formData, 
  prevStep, 
  isSubmitting, 
  handleSubmit 
}) => {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold">Review & Submit</h2>
      <p className="text-muted-foreground mb-6">
        Please review your information before submitting.
      </p>
      
      <div className="space-y-6">
        <div className="glass-card p-4 rounded-lg">
          <h3 className="font-medium mb-3">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-muted-foreground">Business Name</span>
              <span className="font-medium">{formData.businessName || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Owner's Name</span>
              <span className="font-medium">{formData.ownerName || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Email</span>
              <span className="font-medium">{formData.email || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Phone</span>
              <span className="font-medium">{formData.phone || "Not provided"}</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4 rounded-lg">
          <h3 className="font-medium mb-3">Salon Details</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-muted-foreground">Address</span>
              <span className="font-medium">{formData.address || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Salon Type</span>
              <span className="font-medium capitalize">{formData.salonType} Salon</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Description</span>
              <span className="font-medium">{formData.description || "Not provided"}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm">
            By submitting this form, you agree to PLYN's <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>. Your information will be verified before your salon is listed on our platform.
          </p>
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <AnimatedButton
          variant="outline"
          onClick={prevStep}
          className="flex-1"
          type="button"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          variant="gradient"
          className="flex-1"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </AnimatedButton>
      </div>
    </motion.form>
  );
};

export default Step3ReviewSubmit;
