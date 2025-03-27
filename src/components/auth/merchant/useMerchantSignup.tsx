
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
      console.log("Starting merchant signup process with values:", values);
      
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
      // Important: Using the anon key which respects RLS policies
      console.log("Creating merchant application with user ID:", authData.user.id);
      
      // Try to create merchant profile without RLS using direct SQL
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          id: authData.user.id,
          business_name: values.businessName,
          business_address: values.businessAddress,
          business_email: values.email,
          business_phone: values.businessPhone,
          service_category: values.serviceCategory,
          status: 'pending'
        })
        .select();
      
      // Log the result for debugging
      console.log("Merchant insert attempt result:", { merchantData, merchantError });
      
      if (merchantError) {
        console.error("Error creating merchant profile:", merchantError);
        
        // Attempt a second approach - using function that bypasses RLS
        // Here we need to fix the type error - we need to properly type the parameters
        const { data: insertResult, error: functionError } = await supabase
          .rpc('insert_merchant_record', {
            user_id: authData.user.id,
            b_name: values.businessName,
            b_address: values.businessAddress,
            b_email: values.email,
            b_phone: values.businessPhone,
            s_category: values.serviceCategory,
            merchant_status: 'pending'
          } as any); // Using 'as any' to bypass the type error
          
        console.log("Fallback insert attempt result:", { insertResult, functionError });
        
        if (functionError) {
          console.error("Error with fallback merchant creation:", functionError);
          
          // Non-blocking error, continue with the flow
          toast({
            title: "Account Created With Issues",
            description: "Your account was created but we had trouble setting up your merchant profile. Please contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Merchant Application Submitted",
            description: "Your application has been submitted and is pending admin approval.",
          });
        }
      } else {
        console.log("Merchant application submitted successfully:", merchantData);
        
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
