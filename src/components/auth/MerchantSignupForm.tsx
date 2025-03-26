
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Store, Phone } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const merchantSignupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  businessAddress: z.string().min(5, 'Business address is required'),
  businessPhone: z.string().min(10, 'Phone number is required'),
  serviceCategory: z.string().min(1, 'Service category is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type MerchantSignupFormValues = z.infer<typeof merchantSignupSchema>;

const MerchantSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<MerchantSignupFormValues>({
    resolver: zodResolver(merchantSignupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      serviceCategory: 'men', // Default to men's salon
    },
  });

  const onSubmit = async (values: MerchantSignupFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting merchant signup process");
      
      // First, signup with Supabase auth
      const result = await signUp(
        values.email, 
        values.password, 
        values.username, 
        values.businessPhone, 
        undefined, 
        undefined, 
        true // isMerchant flag
      );
      
      if (!result || !result.user || !result.session) {
        throw new Error("Failed to create user account. Please try again.");
      }
      
      console.log("Auth signup complete, user created with ID:", result.user.id);
      
      // Now create the merchant application with pending status
      console.log("Creating merchant application");
      const { error: merchantError } = await supabase
        .from('merchants')
        .insert({
          id: result.user.id,
          business_name: values.businessName,
          business_address: values.businessAddress,
          business_email: values.email,
          business_phone: values.businessPhone,
          service_category: values.serviceCategory,
          status: 'pending'
        });
      
      if (merchantError) {
        console.error("Error creating merchant profile:", merchantError);
        throw merchantError;
      }
      
      console.log("Merchant application submitted successfully for user ID:", result.user.id);
      
      toast({
        title: "Merchant Application Submitted",
        description: "Your application has been submitted and is pending admin approval. You'll be notified once approved.",
      });
      
      // Redirect to pending page
      setTimeout(() => {
        navigate('/merchant-pending', { replace: true });
      }, 1000);
      
    } catch (error: any) {
      console.error('Merchant signup error:', error);
      setError(error.message || 'Failed to create merchant account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <AnimatedButton
          variant="gradient"
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-salon-men to-salon-men-dark"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Submit Merchant Application'}
        </AnimatedButton>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          By submitting this application, you agree to our terms and conditions. 
          Your application will be reviewed by our admin team.
        </p>
      </form>
    </Form>
  );
};

export default MerchantSignupForm;
