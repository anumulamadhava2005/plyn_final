
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                currentStep === stepNumber 
                  ? 'bg-gradient-to-r from-salon-men to-salon-women text-white'
                  : currentStep > stepNumber
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {currentStep > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
            </div>
            <span className="text-xs mt-1 text-muted-foreground">
              {stepNumber === 1 ? 'Info' : stepNumber === 2 ? 'Details' : 'Review'}
            </span>
          </div>
        ))}
        
        <div 
          className="absolute left-0 right-0 h-0.5 top-4 z-0 mx-10"
          style={{
            background: `linear-gradient(to right, 
              ${currentStep > 1 ? 'var(--color-green-500)' : 'var(--color-secondary)'} 50%, 
              ${currentStep > 2 ? 'var(--color-green-500)' : 'var(--color-secondary)'} 50%)`
          }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;
