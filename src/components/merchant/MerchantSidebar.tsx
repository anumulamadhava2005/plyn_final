
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Scissors,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  to: string;
};

const SidebarItem = ({ icon: Icon, label, active = false, to }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export function MerchantSidebar() {
  const { userProfile } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  // Define sidebar navigation items
  const sidebarItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      to: '/merchant-dashboard',
      active: pathname === '/merchant-dashboard'
    },
    { 
      icon: Calendar, 
      label: 'Appointments', 
      to: '/merchant-dashboard?tab=appointments',
      active: pathname === '/merchant-dashboard' && location.search.includes('tab=appointments')
    },
    { 
      icon: Clock, 
      label: 'Time Slots', 
      to: '/merchant-dashboard?tab=availability',
      active: pathname === '/merchant-dashboard' && location.search.includes('tab=availability')
    },
    { 
      icon: Users, 
      label: 'Clients', 
      to: '/merchant-dashboard?tab=clients',
      active: pathname === '/merchant-dashboard' && location.search.includes('tab=clients')
    },
    { 
      icon: Scissors, 
      label: 'Services', 
      to: '/merchant-dashboard?tab=services',
      active: pathname === '/merchant-dashboard' && location.search.includes('tab=services')
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      to: '/merchant-dashboard?tab=settings',
      active: pathname === '/merchant-dashboard' && location.search.includes('tab=settings')
    },
  ];

  return (
    <div className="w-64 h-screen bg-black/95 text-white flex flex-col border-r border-border/30">
      {/* Logo section */}
      <div className="p-4 flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-xl font-bold">
          P
        </div>
        <span className="text-xl font-bold">PLYN</span>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 px-3 py-2 space-y-1">
        {sidebarItems.map((item, index) => (
          <SidebarItem 
            key={index}
            icon={item.icon}
            label={item.label}
            active={item.active}
            to={item.to}
          />
        ))}
      </div>

      {/* User section */}
      <div className="mt-auto p-4 border-t border-border/30">
        <SidebarItem 
          icon={Settings} 
          label="Settings" 
          to="/merchant-dashboard?tab=settings"
          active={pathname === '/merchant-dashboard' && location.search.includes('tab=settings')}
        />
      </div>
    </div>
  );
}

export default MerchantSidebar;
