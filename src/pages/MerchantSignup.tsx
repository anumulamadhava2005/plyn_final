
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import MerchantBenefits from '@/components/merchant/MerchantBenefits';
import StepIndicator from '@/components/merchant/StepIndicator';
import Step1BusinessInfo from '@/components/merchant/steps/Step1BusinessInfo';
import Step2SalonDetails from '@/components/merchant/steps/Step2SalonDetails';
import Step3ReviewSubmit from '@/components/merchant/steps/Step3ReviewSubmit';
import Step4Success from '@/components/merchant/steps/Step4Success';
import { useMerchantSignup } from '@/hooks/useMerchantSignup';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

const MerchantSignup = () => {
  const { 
    step, 
    formData, 
    isSubmitting, 
    handleChange, 
    handleSalonTypeChange, 
    nextStep, 
    prevStep, 
    checkMerchantProfile,
    handleSubmit 
  } = useMerchantSignup();
  
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsLoading(true);
      setAuthError(null);
      
      try {
        // Checking if user is authenticated
        if (!user) {
          console.log("No authenticated user, redirecting to auth page");
          setAuthError("Authentication required. Please sign in to access merchant signup.");
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          return;
        }
        
        console.log("User profile:", userProfile);
        
        // If already checked user profile and confirmed not merchant
        if (userProfile !== null && !userProfile.isMerchant) {
          console.log("User is not registered as a merchant, redirecting to auth page");
          setAuthError("Access restricted. You need to sign up as a merchant to access this page.");
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          return;
        }
        
        // Only check merchant profile if user is authenticated and registered as a merchant
        if (user && userProfile?.isMerchant) {
          console.log("Checking merchant profile");
          await checkMerchantProfile();
        }
      } catch (error) {
        console.error("Error verifying authentication:", error);
        setAuthError("An error occurred while verifying your account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, [user, userProfile, navigate, checkMerchantProfile]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1BusinessInfo 
            formData={formData} 
            handleChange={handleChange} 
            nextStep={nextStep} 
          />
        );
      
      case 2:
        return (
          <Step2SalonDetails 
            formData={formData} 
            handleChange={handleChange}
            handleSalonTypeChange={handleSalonTypeChange}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      
      case 3:
        return (
          <Step3ReviewSubmit 
            formData={formData}
            prevStep={prevStep}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        );
      
      case 4:
        return <Step4Success />;
      
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">Verifying your account...</p>
        </div>
      );
    }
    
    if (authError) {
      return (
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <AnimatedButton
              variant="gradient"
              onClick={() => navigate('/auth')}
              className="mx-auto"
            >
              Go to Login/Signup
            </AnimatedButton>
          </div>
        </div>
      );
    }
    
    return (
      <>
        {step < 4 && <StepIndicator currentStep={step} />}
        {renderStep()}
      </>
    );
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
                  <MerchantBenefits />
                </div>
                
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="glass-card p-6 md:p-8 rounded-xl shadow-lg"
                  >
                    {renderContent()}
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
