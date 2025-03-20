
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-salon-men to-salon-women text-white shadow-md hover:shadow-lg dark:from-salon-men-light dark:to-salon-women-light",
        men: "bg-salon-men text-white shadow hover:bg-salon-men-dark dark:bg-salon-men-light dark:hover:bg-salon-men",
        women: "bg-salon-women text-white shadow hover:bg-salon-women-dark dark:bg-salon-women-light dark:hover:bg-salon-women",
        glass: "bg-white/20 backdrop-blur-lg border border-white/20 text-white shadow-sm hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      anim: {
        none: "",
        shine: "before:absolute before:inset-0 before:-translate-x-full before:animate-[2s_ease_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent hover:before:animate-shine",
        pulse: "transition-transform duration-300 hover:scale-105 active:scale-95",
        underline: "after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-4/5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      anim: "pulse",
    },
  }
);

export interface AnimatedButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, variant, size, anim, icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, anim, className }))}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, buttonVariants };
