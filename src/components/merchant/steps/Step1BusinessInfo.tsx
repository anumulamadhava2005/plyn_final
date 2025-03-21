
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface Step1Props {
  formData: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  nextStep: () => void;
}

const Step1BusinessInfo: React.FC<Step1Props> = ({ formData, handleChange, nextStep }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Business Information</h2>
      <p className="text-muted-foreground mb-6">
        Let's start with some basic information about your salon business.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your salon name"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ownerName">Owner's Name</Label>
          <Input
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Your full name"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Business Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Business Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(123) 456-7890"
            className="mt-1"
            required
          />
        </div>
      </div>
      
      <div className="pt-4">
        <AnimatedButton
          variant="gradient"
          onClick={nextStep}
          className="w-full"
        >
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default Step1BusinessInfo;
