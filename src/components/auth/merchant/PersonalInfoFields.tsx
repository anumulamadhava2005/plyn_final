
import React from 'react';
import { User, Mail } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { MerchantSignupFormValues } from './types';

interface PersonalInfoFieldsProps {
  form: UseFormReturn<MerchantSignupFormValues>;
}

const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="johndoe"
                  {...field}
                  className="pl-10"
                />
              </FormControl>
              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  placeholder="business@example.com"
                  {...field}
                  className="pl-10"
                />
              </FormControl>
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalInfoFields;
