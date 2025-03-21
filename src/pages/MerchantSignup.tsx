
import React, { useEffect } from 'react';
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
  }, [user, userProfile, navigate, checkMerchantProfile, toast]);

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
                    {step < 4 && <StepIndicator currentStep={step} />}
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
