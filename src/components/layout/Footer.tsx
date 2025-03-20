
import React from 'react';
import { Link } from 'react-router-dom';
import LogoAnimation from '@/components/ui/LogoAnimation';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Facebook, Twitter, Instagram, Scissors, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-background dark:bg-dark-bg border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <LogoAnimation size="lg" />
            <p className="text-muted-foreground">
              Revolutionizing the salon booking experience with real-time updates, seamless payments, and dynamic slot management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/book-now" className="text-muted-foreground hover:text-primary transition-colors">Find Salons</Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/merchant-signup" className="text-muted-foreground hover:text-primary transition-colors">For Merchants</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-muted-foreground">
                <Scissors size={16} className="mr-2" />
                <span>Haircuts & Styling</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Scissors size={16} className="mr-2" />
                <span>Beard Trimming</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Scissors size={16} className="mr-2" />
                <span>Hair Coloring</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Scissors size={16} className="mr-2" />
                <span>Facial & Skincare</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Scissors size={16} className="mr-2" />
                <span>Manicure & Pedicure</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 text-primary mt-1" />
                <span className="text-muted-foreground">123 Booking Street, Suite 100, San Francisco, CA 94107</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-primary" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary" />
                <span className="text-muted-foreground">hello@plyn.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <AnimatedButton variant="outline" size="sm">
                Contact Support
              </AnimatedButton>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {year} PLYN. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
