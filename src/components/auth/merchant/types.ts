
import { z } from 'zod';

// Schema definition for merchant signup
export const merchantSignupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  businessAddress: z.string().min(5, 'Business address is required'),
  businessPhone: z.string().min(10, 'Phone number is required'),
  serviceCategory: z.string().min(1, 'Service category is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type definition derived from the schema
export type MerchantSignupFormValues = z.infer<typeof merchantSignupSchema>;
