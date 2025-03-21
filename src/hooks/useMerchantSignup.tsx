
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MerchantFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  salonType: string;
  description: string;
}

const initialFormData: MerchantFormData = {
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  salonType: 'men',
  description: '',
};

export const useMerchantSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MerchantFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

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

  return {
    step,
    formData,
    isSubmitting,
    handleChange,
    handleSalonTypeChange,
    nextStep,
    prevStep,
    checkMerchantProfile,
    handleSubmit,
  };
};
