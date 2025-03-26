
import React from 'react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading }) => {
  return (
    <>
      <AnimatedButton
        variant="gradient"
        type="submit"
        className="w-full mt-6 bg-gradient-to-r from-salon-men to-salon-men-dark"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Submit Merchant Application'}
      </AnimatedButton>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        By submitting this application, you agree to our terms and conditions. 
        Your application will be reviewed by our admin team.
      </p>
    </>
  );
};

export default SubmitButton;
