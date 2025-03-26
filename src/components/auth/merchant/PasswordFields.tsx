
import React from 'react';
import { Lock } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { MerchantSignupFormValues } from './types';

interface PasswordFieldsProps {
  form: UseFormReturn<MerchantSignupFormValues>;
}

const PasswordFields: React.FC<PasswordFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  className="pl-10"
                />
              </FormControl>
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  className="pl-10"
                />
              </FormControl>
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default PasswordFields;
