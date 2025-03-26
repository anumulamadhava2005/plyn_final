
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { merchantSignupSchema, MerchantSignupFormValues } from './merchant/types';
import { useMerchantSignup } from './merchant/useMerchantSignup';
import PersonalInfoFields from './merchant/PersonalInfoFields';
import BusinessInfoFields from './merchant/BusinessInfoFields';
import PasswordFields from './merchant/PasswordFields';
import SubmitButton from './merchant/SubmitButton';
import ErrorAlert from './merchant/ErrorAlert';

const MerchantSignupForm = () => {
  const { isLoading, error, handleSignup } = useMerchantSignup();

  const form = useForm<MerchantSignupFormValues>({
    resolver: zodResolver(merchantSignupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      serviceCategory: 'men', // Default to men's salon
    },
  });

  const onSubmit = async (values: MerchantSignupFormValues) => {
    await handleSignup(values);
  };

  return (
    <Form {...form}>
      <ErrorAlert error={error} />
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PersonalInfoFields form={form} />
        <BusinessInfoFields form={form} />
        <PasswordFields form={form} />
        <SubmitButton isLoading={isLoading} />
      </form>
    </Form>
  );
};

export default MerchantSignupForm;
