
import React from 'react';

interface AuthHeaderProps {
  activeTab: string;
  showMerchantFields?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ activeTab, showMerchantFields = false }) => {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl md:text-3xl font-bold gradient-heading">
        {activeTab === 'login' 
          ? (showMerchantFields ? 'Merchant Login' : 'Welcome Back') 
          : 'Create Account'}
      </h1>
      <p className="text-muted-foreground mt-2">
        {activeTab === 'login' 
          ? (showMerchantFields 
              ? 'Sign in to your merchant account' 
              : 'Sign in to access your account and bookings')
          : 'Join PLYN to start booking appointments'}
      </p>
    </div>
  );
};

export default AuthHeader;
