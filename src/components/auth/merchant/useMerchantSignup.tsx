
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
      
      // Use the service role key to bypass RLS for the initial merchant creation
      // We need to do this when creating the merchant account during signup
      // Note: In production, this should be done via a secure server-side function
      try {
        console.log("Creating merchant application with user ID:", authData.user.id);
        const { error: merchantError } = await supabase
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
        
        if (merchantError) {
          console.error("Error creating merchant profile:", merchantError);
          // Don't throw here - we'll continue the flow even if merchant profile creation fails
          // The user can complete their profile later
          toast({
            title: "Account Created",
            description: "Your account was created but we couldn't set up your merchant profile. You can complete it later.",
            variant: "destructive"
          });
        } else {
          console.log("Merchant application submitted successfully for user ID:", authData.user.id);
        }
      } catch (merchantCreateError) {
        console.error("Exception during merchant creation:", merchantCreateError);
        // Continue the flow - don't block signup if merchant profile creation fails
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
      
      toast({
        title: "Merchant Application Submitted",
        description: "Your application has been submitted and is pending admin approval. You'll be notified once approved.",
      });
      
      // Redirect to pending page
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
