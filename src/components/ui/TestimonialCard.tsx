
import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  name: string;
  role: string;
  image?: string;
  content: string;
  rating: number;
  className?: string;
  variant?: 'user' | 'merchant';
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  image,
  content,
  rating,
  className,
  variant = 'user'
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass-card p-6 transition-all",
        variant === 'user' ? 'border-salon-men/20 dark:border-salon-men-light/20' : 'border-salon-women/20 dark:border-salon-women-light/20',
        className
      )}
    >
      <div className="flex gap-4 items-center mb-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg",
          variant === 'user' ? 'bg-salon-men dark:bg-salon-men-light' : 'bg-salon-women dark:bg-salon-women-light'
        )}>
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={cn(
              i < rating 
                ? `fill-current ${variant === 'user' ? 'text-salon-men dark:text-salon-men-light' : 'text-salon-women dark:text-salon-women-light'}` 
                : 'text-muted',
              'mr-0.5'
            )}
          />
        ))}
      </div>
      
      <p className="text-muted-foreground">{content}</p>
    </motion.div>
  );
};

export default TestimonialCard;
