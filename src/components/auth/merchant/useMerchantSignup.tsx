
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MerchantSignupFormValues } from './types';

export const useMerchantSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (values: MerchantSignupFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting merchant signup process");
      
      // First, check if the username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', values.username);
        
      if (checkError) {
        console.error("Error checking username:", checkError);
        throw checkError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        console.error("Username already exists");
        throw new Error("Username already exists. Please choose a different username.");
      }
      
      // Sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            phone_number: values.businessPhone,
            is_merchant: true,
          },
        },
      });
      
      if (authError) {
        console.error("Auth signup error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create user account. Please try again.");
      }
      
      console.log("Auth signup complete, user created with ID:", authData.user.id);
      
      // Create the merchant application with pending status
      console.log("Creating merchant application with user ID:", authData.user.id);
      
      // Try with rls bypass approach first
      let merchantError = null;
      try {
        // Create a new merchant application record
        const { error: insertError } = await supabase
          .from('merchants')
          .insert({
            id: authData.user.id,
            business_name: values.businessName,
            business_address: values.businessAddress,
            business_email: values.email,
            business_phone: values.businessPhone,
            service_category: values.serviceCategory,
            status: 'pending'
          });
          
        merchantError = insertError;
        
        if (insertError) {
          console.error("Error creating merchant profile with regular method:", insertError);
          throw insertError;
        }
      } catch (err) {
        console.error("Exception during merchant creation:", err);
        merchantError = err as any;
      }
      
      if (merchantError) {
        console.error("Error creating merchant profile:", merchantError);
        
        // Non-blocking error, continue with the flow
        toast({
          title: "Account Created",
          description: "Your account was created but we couldn't set up your merchant profile. You can complete it later.",
          variant: "destructive"
        });
      } else {
        console.log("Merchant application submitted successfully for user ID:", authData.user.id);
        
        toast({
          title: "Merchant Application Submitted",
          description: "Your application has been submitted and is pending admin approval. You'll be notified once approved.",
        });
      }
      
      // Update the profile record to ensure is_merchant is true
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_merchant: true })
        .eq('id', authData.user.id);
        
      if (profileError) {
        console.error("Error updating profile merchant status:", profileError);
        // Non-blocking error, continue with the flow
      }
      
      // Always redirect to the pending page
      console.log("Redirecting to merchant-pending page");
      navigate('/merchant-pending', { replace: true });
      
    } catch (error: any) {
      console.error('Merchant signup error:', error);
      setError(error.message || 'Failed to create merchant account. Please try again.');
      setIsLoading(false);
      return false;
    } finally {
      setIsLoading(false);
    }
    
    return true;
  };

  return {
    isLoading,
    error,
    handleSignup,
    setError
  };
};
