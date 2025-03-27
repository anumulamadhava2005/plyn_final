
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
      
      // Create the merchant record - tried with RPC to bypass RLS
      const merchantData = {
        id: authData.user.id,
        business_name: values.businessName,
        business_address: values.businessAddress,
        business_email: values.email,
        business_phone: values.businessPhone,
        service_category: values.serviceCategory,
        status: 'pending'
      };
      
      console.log("Creating merchant record:", merchantData);
      
      // Try first approach - direct insert with explicit ID
      const { data: insertedMerchant, error: merchantError } = await supabase
        .from('merchants')
        .insert(merchantData)
        .select();
      
      if (merchantError) {
        console.error("Error inserting merchant record:", merchantError);
        
        // Try second approach - call RPC function to insert merchant
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('insert_merchant_record', {
            user_id: authData.user.id,
            b_name: values.businessName,
            b_address: values.businessAddress,
            b_email: values.email,
            b_phone: values.businessPhone,
            s_category: values.serviceCategory,
            merchant_status: 'pending'
          });
        
        if (rpcError) {
          console.error("RPC error creating merchant record:", rpcError);
          
          // If both approaches fail, notify but continue
          toast({
            title: "Account Created With Issues",
            description: "Your account was created but we had trouble setting up your merchant profile. Please contact support.",
            variant: "destructive"
          });
        } else {
          console.log("Merchant record created via RPC:", rpcResult);
          toast({
            title: "Merchant Application Submitted",
            description: "Your application has been submitted and is pending admin approval.",
          });
        }
      } else {
        console.log("Merchant record created successfully:", insertedMerchant);
        toast({
          title: "Merchant Application Submitted",
          description: "Your application has been submitted and is pending admin approval.",
        });
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
