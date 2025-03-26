
import React from 'react';
import { Store, Phone } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { MerchantSignupFormValues } from './types';

interface BusinessInfoFieldsProps {
  form: UseFormReturn<MerchantSignupFormValues>;
}

const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="Your Salon Name"
                  {...field}
                  className="pl-10"
                />
              </FormControl>
              <Store className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="businessAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Address</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="123 Main St, City, State"
                  {...field}
                  className="pl-10"
                />
              </FormControl>
              <Store className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="businessPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Phone</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="+1 (123) 456-7890"
                    {...field}
                    className="pl-10"
                  />
                </FormControl>
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serviceCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Category</FormLabel>
              <div className="relative">
                <FormControl>
                  <select 
                    {...field}
                    className="w-full pl-10 h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="men">Men's Salon</option>
                    <option value="women">Women's Salon</option>
                    <option value="unisex">Unisex Salon</option>
                  </select>
                </FormControl>
                <Store className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default BusinessInfoFields;
