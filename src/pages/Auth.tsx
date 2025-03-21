import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Phone, Calendar, Users, Store } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  isMerchant: z.boolean().default(false),
});

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().optional(),
  age: z.string().refine(val => !val || (parseInt(val) >= 18 && parseInt(val) <= 100), {
    message: 'Age must be between 18 and 100',
  }).optional(),
  gender: z.string().optional(),
  isMerchant: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const merchantSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessAddress: z.string().min(3, 'Address must be at least 3 characters'),
  businessPhone: z.string().min(5, 'Phone number must be at least 5 characters'),
  businessEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type MerchantLoginFormValues = z.infer<typeof merchantSchema>;

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showMerchantFields, setShowMerchantFields] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      isMerchant: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      age: '',
      gender: '',
      isMerchant: false,
    },
  });
  
  const merchantLoginForm = useForm<MerchantLoginFormValues>({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      
      if (values.isMerchant) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_merchant')
          .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
          .single();
          
        if (!profileData?.is_merchant) {
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: "This account is not registered as a merchant.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const { data: merchantData, error: merchantError } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
          .single();
          
        if (merchantError || !merchantData) {
          navigate('/merchant-signup');
          return;
        }
        
        navigate('/merchant-dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signUp(
        values.email, 
        values.password, 
        values.username, 
        values.phoneNumber, 
        values.age ? parseInt(values.age) : undefined, 
        values.gender,
        values.isMerchant
      );
      
      if (values.isMerchant) {
        toast({
          title: "Merchant Account Created",
          description: "Please complete your merchant profile",
        });
        
        setTimeout(() => {
          navigate('/merchant-signup');
        }, 1000);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "There was an error creating your account",
        variant: "destructive",
      });
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onMerchantLoginSubmit = async (values: MerchantLoginFormValues) => {
    setIsLoading(true);
    try {
      const { data: merchants, error: merchantError } = await supabase
        .from('merchants')
        .select('*, profiles(email)')
        .eq('business_name', values.businessName)
        .eq('business_email', values.businessEmail)
        .eq('business_phone', values.businessPhone);
        
      if (merchantError || !merchants || merchants.length === 0) {
        toast({
          title: "Merchant login failed",
          description: "No matching merchant account found. Please check your business details.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const merchant = merchants[0];
      const userEmail = merchant.business_email;
      
      try {
        await signIn(userEmail, values.password);
        
        navigate('/merchant-dashboard');
      } catch (signInError) {
        toast({
          title: "Authentication failed",
          description: "Invalid credentials. Please check your password.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Merchant login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      console.error('Merchant login error:', error);
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
                    {activeTab === 'login' 
                      ? (showMerchantFields ? 'Merchant Login' : 'Welcome Back') 
                      : 'Create Account'}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {activeTab === 'login' 
                      ? (showMerchantFields 
                          ? 'Sign in to your merchant account' 
                          : 'Sign in to access your account and bookings')
                      : 'Join PLYN to start booking appointments'}
                  </p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    {!showMerchantFields ? (
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
                          
                          <FormField
                            control={loginForm.control}
                            name="isMerchant"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 shadow">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Sign in as a merchant
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex flex-col space-y-3 mt-6">
                            <AnimatedButton
                              variant="gradient"
                              type="submit"
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Signing in...' : 'Sign In'}
                            </AnimatedButton>
                            
                            <button
                              type="button"
                              onClick={() => setShowMerchantFields(true)}
                              className="text-sm text-primary underline text-center"
                            >
                              Sign in with business details instead
                            </button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <Form {...merchantLoginForm}>
                        <form onSubmit={merchantLoginForm.handleSubmit(onMerchantLoginSubmit)} className="space-y-4">
                          <FormField
                            control={merchantLoginForm.control}
                            name="businessName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      placeholder="Your business name"
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
                            control={merchantLoginForm.control}
                            name="businessEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Email</FormLabel>
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
                          
                          <FormField
                            control={merchantLoginForm.control}
                            name="businessPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Phone</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      placeholder="(123) 456-7890"
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
                            control={merchantLoginForm.control}
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
                          
                          <div className="flex flex-col space-y-3 mt-6">
                            <AnimatedButton
                              variant="gradient"
                              type="submit"
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Signing in...' : 'Sign In as Merchant'}
                            </AnimatedButton>
                            
                            <button
                              type="button"
                              onClick={() => setShowMerchantFields(false)}
                              className="text-sm text-primary underline text-center"
                            >
                              Go back to regular login
                            </button>
                          </div>
                        </form>
                      </Form>
                    )}
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
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number (Optional)</FormLabel>
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
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={signupForm.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age (Optional)</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="25"
                                      {...field}
                                      className="pl-10"
                                    />
                                  </FormControl>
                                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={signupForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender (Optional)</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="pl-10">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <Users className="absolute left-3 top-11 h-5 w-5 text-muted-foreground" />
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="non-binary">Non-binary</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
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
                        
                        <FormField
                          control={signupForm.control}
                          name="isMerchant"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 shadow">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Sign up as a merchant
                                </FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  You'll need to provide business details after signup
                                </p>
                              </div>
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
