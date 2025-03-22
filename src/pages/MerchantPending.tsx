
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Store } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { useAuth } from '@/context/AuthContext';

const MerchantPending = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/merchant-login');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20 flex items-center">
          <section className="w-full py-12 px-4">
            <div className="container mx-auto max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="glass-card p-8 rounded-xl shadow-lg text-center"
              >
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-orange-500" />
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-4">Application Pending</h1>
                
                <p className="text-muted-foreground mb-6">
                  Your merchant account is pending approval from our administrators. 
                  We'll review your application and notify you once it's approved.
                </p>
                
                <div className="bg-muted/50 p-4 rounded-lg mb-8">
                  <div className="flex items-center justify-center mb-2">
                    <Store className="h-5 w-5 mr-2 text-salon-men" />
                    <p className="font-medium">What happens next?</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our team will verify your business information, typically within 24-48 hours.
                    You'll receive an email notification once your account is approved.
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => navigate('/')}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Return to Homepage
                  </AnimatedButton>
                  
                  {user && (
                    <AnimatedButton
                      variant="outline"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </AnimatedButton>
                  )}
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

export default MerchantPending;
