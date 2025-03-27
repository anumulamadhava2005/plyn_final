
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Store, AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { supabase } from '@/integrations/supabase/client';

const merchantLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type MerchantLoginFormValues = z.infer<typeof merchantLoginSchema>;

const MerchantLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { merchantLogin, user, isMerchant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // We're removing the useEffect hook that was causing redirect loops
  // and handling navigation directly in the onSubmit function

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
      // First, sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (authError) {
        console.error('Auth login error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to authenticate. Please try again.');
      }
      
      // Check if user is a merchant
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_merchant')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error('Profile check error:', profileError);
        throw profileError;
      }
      
      if (!profileData.is_merchant) {
        throw new Error('This account is not registered as a merchant. Please use a merchant account.');
      }
      
      // Update auth context with merchantLogin
      await merchantLogin(values.email, values.password);
      
      // Check merchant status
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('status')
        .eq('id', authData.user.id)
        .maybeSingle();
        
      if (merchantError) {
        console.error('Merchant status check error:', merchantError);
        throw merchantError;
      }
      
      // Redirect based on merchant status
      if (merchantData && merchantData.status === 'approved') {
        console.log("Merchant is approved, redirecting to dashboard");
        navigate('/merchant-dashboard', { replace: true });
      } else if (merchantData && merchantData.status === 'pending') {
        console.log("Merchant application is pending");
        navigate('/merchant-pending', { replace: true });
      } else {
        toast({
          title: "Account Status Unknown",
          description: "There was an issue determining your account status. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Merchant login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate('/merchant-auth', {
      state: { initialTab: 'signup' }
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="glass-card p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-salon-men"
              >
                <div className="text-center mb-8">
                  <Store className="mx-auto h-12 w-12 text-salon-men mb-2" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-salon-men to-salon-men-dark bg-clip-text text-transparent">
                    Merchant Login
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Access your merchant dashboard
                  </p>
                </div>
                
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
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
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-salon-men to-salon-men-dark hover:from-salon-men-dark hover:to-salon-men text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In as Merchant'}
                      </Button>
                    </div>
                    
                    <div className="mt-6 text-center text-sm">
                      <p className="text-muted-foreground">
                        Looking for regular customer login? <a href="/auth" className="text-salon-men hover:underline">Sign in here</a>
                      </p>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Button variant="link" onClick={handleSignupClick} className="text-salon-men p-0">
                        Don't have a merchant account? Sign up here
                      </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm">
                      <p className="text-center text-muted-foreground">
                        Need help? Contact PLYN support team for assistance.
                      </p>
                    </div>
                  </form>
                </Form>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MerchantLogin;
