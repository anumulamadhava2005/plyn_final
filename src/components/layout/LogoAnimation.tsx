
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface LogoAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const LogoAnimation: React.FC<LogoAnimationProps> = ({ 
  size = 'md',
  withText = true,
  className = ""
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <motion.div
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center"
      >
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-salon-men to-salon-women rounded-lg opacity-80 animate-pulse-slow" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white">
            P
          </div>
        </div>
        
        {withText && (
          <motion.span 
            variants={logoVariants}
            className={`font-bold ml-2 gradient-heading ${textSizeClasses[size]}`}
          >
            {'PLYN'.split('').map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

export default LogoAnimation;
