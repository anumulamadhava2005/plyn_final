
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

const Step4Success = () => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 py-8"
    >
      <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
        <Check className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-bold">Application Submitted!</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Thank you for applying to join PLYN as a merchant. You can now access your merchant dashboard.
      </p>
      
      <div className="pt-4">
        <AnimatedButton
          variant="gradient"
          onClick={() => navigate('/merchant-dashboard')}
          className="px-8"
        >
          Go to Merchant Dashboard
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default Step4Success;
