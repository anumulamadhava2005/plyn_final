
import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'men' | 'women' | 'default';
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  variant = 'default',
  className 
}) => {
  const variants = {
    default: 'bg-white dark:bg-dark-card border border-border',
    men: 'border-salon-men/20 dark:border-salon-men-light/20',
    women: 'border-salon-women/20 dark:border-salon-women-light/20',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary dark:bg-primary/20',
    men: 'bg-salon-men/10 text-salon-men dark:bg-salon-men-light/20 dark:text-salon-men-light',
    women: 'bg-salon-women/10 text-salon-women dark:bg-salon-women-light/20 dark:text-salon-women-light',
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "glass-card p-6 transition-all duration-300",
        variants[variant],
        className
      )}
    >
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl mb-4",
        iconVariants[variant]
      )}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
