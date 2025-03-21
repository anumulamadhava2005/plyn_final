
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      // Navigation handled by useEffect when user state changes
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.username);
      // Navigation handled by useEffect when user state changes
    } catch (error) {
      console.error('Signup error:', error);
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
                className="glass-card p-6 md:p-8 rounded-xl shadow-lg"
              >
                <div className="mb-6 text-center">
                  <h1 className="text-2xl md:text-3xl font-bold gradient-heading">
                    {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {activeTab === 'login' 
                      ? 'Sign in to access your account and bookings' 
                      : 'Join PLYN to start booking appointments'}
                  </p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    placeholder="your@email.com"
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
                          control={loginForm.control}
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
                        
                        <AnimatedButton
                          variant="gradient"
                          type="submit"
                          className="w-full mt-6"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Signing in...' : 'Sign In'}
                        </AnimatedButton>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
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
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    placeholder="your@email.com"
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
                          control={signupForm.control}
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
                          control={signupForm.control}
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
                          className="w-full mt-6"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </AnimatedButton>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Auth;
