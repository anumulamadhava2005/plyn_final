
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const merchantLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type MerchantLoginFormValues = z.infer<typeof merchantLoginSchema>;

const MerchantLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { merchantLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<MerchantLoginFormValues>({
    resolver: zodResolver(merchantLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: MerchantLoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting merchant login for:", values.email);
      await merchantLogin(values.email, values.password);
      // No need to navigate here, the useEffect in MerchantAuth component will handle the redirects
    } catch (error: any) {
      console.error('Merchant login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate('/merchant-auth');
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="merchant@example.com"
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

        <div className="flex flex-col gap-3 mt-4">
          <AnimatedButton
            variant="gradient"
            type="submit"
            className="w-full bg-gradient-to-r from-salon-men to-salon-men-dark"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In as Merchant'}
          </AnimatedButton>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleSignupClick}
            className="w-full"
          >
            Sign Up as Merchant
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MerchantLoginForm;
