
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';

const Terms = () => {
  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <main className="flex-1 py-8 px-4 md:px-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
              
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Last Updated: April 15, 2025
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing or using the HairHub platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  HairHub provides a platform connecting customers with beauty, wellness, and health professionals. We facilitate appointment booking but are not directly responsible for the services provided by professionals on our platform.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground mb-4">
                  You must create an account to use certain features of our platform. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">4. Booking and Cancellation</h2>
                <p className="text-muted-foreground mb-4">
                  When you book an appointment through HairHub, you are entering into an agreement with the service provider. Cancellation policies are set by individual service providers and must be respected.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">5. Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and share your information.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">6. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  HairHub is not liable for the quality, safety, or satisfaction of services provided by professionals on our platform. We strive to vet our professionals but cannot guarantee their performance.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">7. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We may update these Terms of Service from time to time. We will notify users of significant changes, but it is your responsibility to review these terms periodically.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please contact us at support@hairhub.com.
                </p>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Terms;
