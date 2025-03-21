
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Clock, CreditCard, BarChart3, Bell, Scissors } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const MerchantSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    salonType: 'men',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access merchant signup.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (userProfile && !userProfile.isMerchant) {
      toast({
        title: "Access Restricted",
        description: "You need to sign up as a merchant to access this page.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (user && userProfile?.isMerchant) {
      checkMerchantProfile();
    }
  }, [user, userProfile, navigate]);

  const checkMerchantProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        toast({
          title: "Profile Already Complete",
          description: "Your merchant profile is already set up.",
        });
        navigate('/merchant-dashboard');
      }
    } catch (error) {
      console.error("Error checking merchant profile:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalonTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      salonType: value
    }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your merchant profile.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting merchant profile with data:", {
        id: user.id,
        business_name: formData.businessName,
        business_address: formData.address,
        business_phone: formData.phone,
        business_email: formData.email || user.email,
        service_category: formData.salonType
      });
      
      const { data, error } = await supabase
        .from('merchants')
        .insert({
          id: user.id,
          business_name: formData.businessName,
          business_address: formData.address,
          business_phone: formData.phone,
          business_email: formData.email || user.email,
          service_category: formData.salonType
        })
        .select();
        
      if (error) {
        console.error("Error during merchant profile creation:", error);
        throw error;
      }
      
      console.log("Merchant profile created successfully:", data);
      
      // Update the user's profile to ensure isMerchant is true
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_merchant: true })
        .eq('id', user.id);
        
      if (profileError) {
        console.error("Error updating profile merchant status:", profileError);
      }
      
      setStep(4);
      window.scrollTo(0, 0);
      
      toast({
        title: "Merchant Profile Created",
        description: "Your merchant profile has been successfully created!",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error creating your merchant profile.",
        variant: "destructive",
      });
      console.error('Merchant profile creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Smart Slot Management",
      description: "Dynamic scheduling that adapts to your pace and maximizes your salon's efficiency."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Real-time Notifications",
      description: "Instant alerts for new bookings, cancellations, and customer arrivals."
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Hassle-free payment processing with same-day deposits available."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Comprehensive Analytics",
      description: "Detailed reports on revenue, customer retention, peak hours, and growth opportunities."
    }
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Business Information</h2>
            <p className="text-muted-foreground mb-6">
              Let's start with some basic information about your salon business.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Your salon name"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="ownerName">Owner's Name</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Business Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="mt-1"
                  required
                />
              </div>
            </div>
            
            <div className="pt-4">
              <AnimatedButton
                variant="gradient"
                onClick={nextStep}
                className="w-full"
              >
                Continue
              </AnimatedButton>
            </div>
          </motion.div>
        );
      
      case 2:
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
      
      case 3:
        return (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <h2 className="text-2xl font-bold">Review & Submit</h2>
            <p className="text-muted-foreground mb-6">
              Please review your information before submitting.
            </p>
            
            <div className="space-y-6">
              <div className="glass-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground">Business Name</span>
                    <span className="font-medium">{formData.businessName || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Owner's Name</span>
                    <span className="font-medium">{formData.ownerName || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Email</span>
                    <span className="font-medium">{formData.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Phone</span>
                    <span className="font-medium">{formData.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-4 rounded-lg">
                <h3 className="font-medium mb-3">Salon Details</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground">Address</span>
                    <span className="font-medium">{formData.address || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Salon Type</span>
                    <span className="font-medium capitalize">{formData.salonType} Salon</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Description</span>
                    <span className="font-medium">{formData.description || "Not provided"}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  By submitting this form, you agree to PLYN's <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>. Your information will be verified before your salon is listed on our platform.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <AnimatedButton
                variant="outline"
                onClick={prevStep}
                className="flex-1"
                type="button"
              >
                Back
              </AnimatedButton>
              <AnimatedButton
                variant="gradient"
                className="flex-1"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </AnimatedButton>
            </div>
          </motion.form>
        );
      
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <Check className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thank you for applying to join PLYN as a merchant. You can now access your merchant dashboard.
            </p>
            
            <div className="pt-4">
              <AnimatedButton
                variant="gradient"
                onClick={() => navigate('/merchant-dashboard')}
                className="px-8"
              >
                Go to Merchant Dashboard
              </AnimatedButton>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-salon-women/10 text-salon-women dark:bg-salon-women-light/10 dark:text-salon-women-light">
                      For Salon Owners
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">
                      Join PLYN as a Merchant
                    </h1>
                    <p className="text-muted-foreground mb-8">
                      Grow your business with our smart booking system, real-time notifications, and comprehensive analytics.
                    </p>
                    
                    <div className="space-y-6">
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                          className="flex gap-4"
                        >
                          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-salon-women/10 text-salon-women dark:bg-salon-women-light/10 dark:text-salon-women-light">
                            {benefit.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{benefit.title}</h3>
                            <p className="text-muted-foreground">{benefit.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="glass-card p-6 md:p-8 rounded-xl shadow-lg"
                  >
                    {step < 4 && (
                      <div className="mb-8">
                        <div className="flex items-center justify-between relative">
                          {[1, 2, 3].map((stepNumber) => (
                            <div key={stepNumber} className="flex flex-col items-center">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                  step === stepNumber 
                                    ? 'bg-gradient-to-r from-salon-men to-salon-women text-white'
                                    : step > stepNumber
                                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                      : 'bg-secondary text-muted-foreground'
                                }`}
                              >
                                {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                              </div>
                              <span className="text-xs mt-1 text-muted-foreground">
                                {stepNumber === 1 ? 'Info' : stepNumber === 2 ? 'Details' : 'Review'}
                              </span>
                            </div>
                          ))}
                          
                          <div 
                            className="absolute left-0 right-0 h-0.5 top-4 z-0 mx-10"
                            style={{
                              background: `linear-gradient(to right, 
                                ${step > 1 ? 'var(--color-green-500)' : 'var(--color-secondary)'} 50%, 
                                ${step > 2 ? 'var(--color-green-500)' : 'var(--color-secondary)'} 50%)`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {renderStep()}
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MerchantSignup;
