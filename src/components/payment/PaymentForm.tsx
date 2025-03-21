
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { CreditCard, Calendar, User, Phone, Mail, Loader2 } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';

const paymentSchema = z.object({
  cardName: z.string().min(3, "Cardholder name is required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  defaultValues: Partial<PaymentFormValues>;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
  isSubmitting: boolean;
  totalPrice: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  isSubmitting,
  totalPrice
}) => {
  const [paymentMethod, setPaymentMethod] = React.useState('credit_card');
  const [showQRCode, setShowQRCode] = React.useState(false);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 16);
  };
  
  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="payment">Payment Method</TabsTrigger>
            <TabsTrigger value="details">Contact Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment" className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Payment Method</FormLabel>
                  <FormControl>
                    <PaymentMethodSelector
                      selectedMethod={field.value}
                      onMethodChange={(value) => {
                        field.onChange(value);
                        setPaymentMethod(value);
                        if (value === 'qr_code') {
                          setShowQRCode(true);
                        } else {
                          setShowQRCode(false);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showQRCode && (
              <div className="flex flex-col items-center py-4">
                <div className="border-4 border-primary/20 rounded-lg p-2 mb-4">
                  <img 
                    src="https://placekitten.com/200/200" 
                    alt="Payment QR Code" 
                    className="h-48 w-48"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scan this QR code with your UPI app to pay ${totalPrice}
                </p>
              </div>
            )}
            
            {paymentMethod === 'credit_card' && (
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="pl-10"
                          />
                        </FormControl>
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            {...field}
                            value={formatCardNumber(field.value)}
                            onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                            className="pl-10"
                          />
                        </FormControl>
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="MM/YY"
                              {...field}
                              value={formatExpiryDate(field.value)}
                              onChange={(e) => field.onChange(formatExpiryDate(e.target.value))}
                              className="pl-10"
                            />
                          </FormControl>
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="123"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value.slice(0, 4));
                              }}
                              className="pl-10"
                            />
                          </FormControl>
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          {...field}
                          className="pl-10"
                        />
                      </FormControl>
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="+1 (123) 456-7890"
                          {...field}
                          className="pl-10"
                        />
                      </FormControl>
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Any special requests or information for the salon"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <div className="pt-2">
            <AnimatedButton
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ${totalPrice}</>
              )}
            </AnimatedButton>
          </div>
        </form>
      </Tabs>
    </Form>
  );
};

export default PaymentForm;
