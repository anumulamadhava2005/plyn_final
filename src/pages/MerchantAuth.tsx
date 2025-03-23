
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import MerchantLoginForm from '@/components/auth/MerchantLoginForm';
import MerchantSignupForm from '@/components/auth/MerchantSignupForm';
import { Store } from 'lucide-react';

const MerchantAuth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { user, isMerchant, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // This handles redirection when user logs in from another page
  useEffect(() => {
    if (loading) return; // Wait until auth state is loaded
    
    if (!initialLoadComplete) {
      setInitialLoadComplete(true);
      return; // Skip first render to prevent redirect flash
    }
    
    console.log("Auth state in MerchantAuth:", { user, isMerchant, loading, path: location.pathname });
    
    if (user && isMerchant) {
      console.log("Merchant authenticated, redirecting to dashboard");
      navigate('/merchant-dashboard', { replace: true });
    } else if (user && !isMerchant) {
      console.log("User authenticated but not a merchant, redirecting to home");
      navigate('/', { replace: true });
    }
  }, [user, isMerchant, loading, navigate, initialLoadComplete, location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="glass-card p-6 md:p-8 rounded-xl shadow-lg border-t-4 border-salon-men"
              >
                <div className="text-center mb-8">
                  <Store className="mx-auto h-12 w-12 text-salon-men mb-2" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-salon-men to-salon-men-dark bg-clip-text text-transparent">
                    Merchant Portal
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {activeTab === 'login' 
                      ? 'Sign in to manage your salon business' 
                      : 'Register your salon on our platform'}
                  </p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <MerchantLoginForm />
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <MerchantSignupForm />
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 text-center text-sm">
                  <p className="text-muted-foreground">
                    Looking for regular customer login? <a href="/auth" className="text-salon-men hover:underline">Sign in here</a>
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MerchantAuth;
