
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface Step2Props {
  formData: {
    address: string;
    salonType: string;
    description: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSalonTypeChange: (value: string) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const Step2SalonDetails: React.FC<Step2Props> = ({ 
  formData, 
  handleChange, 
  handleSalonTypeChange, 
  prevStep, 
  nextStep 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Salon Details</h2>
      <p className="text-muted-foreground mb-6">
        Tell us more about your salon and services.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Salon Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full street address"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label className="block mb-2">Salon Type</Label>
          <RadioGroup 
            value={formData.salonType} 
            onValueChange={handleSalonTypeChange}
            className="flex flex-wrap gap-4"
          >
            <div className="flex-1 min-w-[120px]">
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.salonType === 'men' ? 'border-salon-men bg-salon-men/5 dark:border-salon-men-light dark:bg-salon-men-light/5' : 'border-border'}`}>
                <div className="flex items-center">
                  <RadioGroupItem 
                    value="men" 
                    id="men"
                    className="text-salon-men dark:text-salon-men-light"
                  />
                  <Label htmlFor="men" className="ml-2 cursor-pointer">Men's Salon</Label>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.salonType === 'women' ? 'border-salon-women bg-salon-women/5 dark:border-salon-women-light dark:bg-salon-women-light/5' : 'border-border'}`}>
                <div className="flex items-center">
                  <RadioGroupItem 
                    value="women" 
                    id="women"
                    className="text-salon-women dark:text-salon-women-light"
                  />
                  <Label htmlFor="women" className="ml-2 cursor-pointer">Women's Salon</Label>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <div className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.salonType === 'unisex' ? 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center">
                  <RadioGroupItem 
                    value="unisex" 
                    id="unisex"
                  />
                  <Label htmlFor="unisex" className="ml-2 cursor-pointer">Unisex Salon</Label>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <Label htmlFor="description">Salon Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell potential customers about your salon and what makes it special"
            className="mt-1 h-32"
            required
          />
        </div>
      </div>
      
      <div className="flex gap-4 pt-4">
        <AnimatedButton
          variant="outline"
          onClick={prevStep}
          className="flex-1"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          variant="gradient"
          onClick={nextStep}
          className="flex-1"
        >
          Continue
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default Step2SalonDetails;
