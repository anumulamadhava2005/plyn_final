
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Coins } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  plyCoinsEnabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ 
  selectedMethod, 
  onMethodChange,
  plyCoinsEnabled = true
}) => {
  // PLYN Coins payment method (only shown if enabled)
  const plyCoinsMethod = {
    id: 'plyn_coins',
    name: 'PLYN Coins',
    icon: <Coins className="h-5 w-5 text-primary" />,
    description: 'Pay using your PLYN Coins (2 coins = $1)'
  };
  
  // Only show PLYN coins since that's all we need
  const paymentMethods = plyCoinsEnabled ? [plyCoinsMethod] : [];

  return (
    <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-3">
      {paymentMethods.map((method) => (
        <div key={method.id} className="flex items-center">
          <RadioGroupItem 
            value={method.id} 
            id={method.id}
            className="peer sr-only" 
          />
          <Label
            htmlFor={method.id}
            className="flex items-center gap-3 w-full p-4 cursor-pointer rounded-lg border border-border peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/40">
              {method.icon}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{method.name}</p>
              <p className="text-xs text-muted-foreground">{method.description}</p>
            </div>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default PaymentMethodSelector;
