
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import PageTransition from '@/components/transitions/PageTransition';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Define admin credentials - make sure these are exactly as specified
const ADMIN_EMAIL = "srimanmudavath@gmail.com";
const ADMIN_PASSWORD = "chinnu@chintu@pandu";

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct credential check without using Supabase authentication
      if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
        // Store admin login state in sessionStorage
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        sessionStorage.setItem('adminEmail', ADMIN_EMAIL);
        
        // Login successful
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard!",
        });
        
        // Redirect to admin dashboard immediately with replace: true to prevent back navigation
        navigate('/admin-dashboard', { replace: true });
      } else {
        throw new Error("Invalid admin credentials. Access denied.");
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
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
                className="glass-card p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-red-500"
              >
                <div className="text-center mb-8">
                  <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-2" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    Admin Portal
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Restricted access. Admin credentials required.
                  </p>
                </div>
                
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
                          <FormLabel>Admin Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="admin@example.com"
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
                          <FormLabel>Admin Password</FormLabel>
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
                      className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Admin Sign In'}
                    </AnimatedButton>
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

export default AdminAuth;
