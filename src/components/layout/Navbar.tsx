
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Calendar, Layout, Store, Settings } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import LogoAnimation from '@/components/ui/LogoAnimation';
import NavLink from '@/components/layout/NavLink';
import NotificationsPopover from '@/components/notifications/NotificationsPopover';

// Customer navigation links
const customerNavLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Find Salons', path: '/book-now' },
  { label: 'Hair Recommendation', path: '/hair-recommendation' },
  { label: 'My Bookings', path: '/my-bookings' },
];

// Merchant navigation links
const merchantNavLinks = [
  { label: 'Dashboard', path: '/merchant-dashboard' },
  { label: 'Bookings', path: '/merchant-dashboard?tab=appointments' },
  { label: 'Availability', path: '/merchant-dashboard?tab=availability' },
  { label: 'Settings', path: '/merchant-dashboard?tab=settings' },
];

// Admin navigation links
const adminNavLinks = [
  { label: 'Dashboard', path: '/admin-dashboard' },
  { label: 'Applications', path: '/admin-dashboard?tab=applications' },
  { label: 'Merchants', path: '/admin-dashboard?tab=merchants' },
  { label: 'Analytics', path: '/admin-dashboard?tab=analytics' },
];

export const ProfileDropdown = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const navigate = useNavigate();
  const { isMerchant, isAdmin } = useAuth();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full border border-border p-1 text-sm font-medium hover:bg-accent/50">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.avatar_url || ''}
              alt={user.email || 'User'} 
            />
            <AvatarFallback>
              {(user.email?.charAt(0) || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isAdmin ? 'Administrator' : isMerchant ? 'Merchant' : 'Customer'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        {!isMerchant && !isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>My Bookings</span>
          </DropdownMenuItem>
        )}
        
        {isMerchant && (
          <DropdownMenuItem onClick={() => navigate('/merchant-dashboard')}>
            <Store className="mr-2 h-4 w-4" />
            <span>Merchant Dashboard</span>
          </DropdownMenuItem>
        )}
        
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin-dashboard')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, isMerchant, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Determine which nav links to show based on user role
  const navLinks = isAdmin 
    ? adminNavLinks 
    : isMerchant 
      ? merchantNavLinks 
      : customerNavLinks;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="fixed w-full top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to={isMerchant ? '/merchant-dashboard' : isAdmin ? '/admin-dashboard' : '/'} className="flex items-center">
              <LogoAnimation size="sm" />
              {isMerchant && <span className="ml-2 font-medium">Merchant Portal</span>}
              {isAdmin && <span className="ml-2 font-medium">Admin Portal</span>}
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className="nav-link">
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <NotificationsPopover />
                <ProfileDropdown user={user} onLogout={handleLogout} />
              </>
            ) : (
              <>
                <Button variant="default" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <div className="hidden md:block">
                  <Button variant="outline" size="sm" onClick={() => navigate('/merchant-login')}>
                    For Merchants
                  </Button>
                </div>
              </>
            )}
            <ThemeToggle />
            <button 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden fixed left-0 top-16 w-full bg-background border-b border-border z-50 transition-all duration-300 ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className="block py-2 px-4 rounded-md hover:bg-accent hover:text-accent-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link
                to="/profile"
                className="block py-2 px-4 rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="default" size="sm" className="w-full" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate('/merchant-login')}>
                For Merchants
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
