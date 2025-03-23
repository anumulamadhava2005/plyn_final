
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className = '',
  activeClassName = 'text-primary font-medium',
  onClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-2 rounded-md text-sm transition-colors hover:text-primary',
        className,
        isActive && activeClassName
      )}
      onClick={(e) => {
        // Execute the onClick handler if provided
        if (onClick) {
          onClick();
        }
      }}
    >
      {children}
    </Link>
  );
};

export default NavLink;
