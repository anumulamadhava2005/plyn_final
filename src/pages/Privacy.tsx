
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';

const Privacy = () => {
  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <main className="flex-1 py-8 px-4 md:px-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
              
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Last Updated: April 15, 2025
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We collect personal information when you create an account, book an appointment, or interact with our platform. This may include your name, email address, phone number, location, and payment information.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We use your information to provide our services, process transactions, send notifications about appointments, and improve our platform. We may also use your information to customize your experience and communicate about promotions or updates.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We share your information with service providers when you book an appointment. We may also share information with third-party service providers who help us operate our platform, process payments, or analyze data.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">4. Your Choices</h2>
                <p className="text-muted-foreground mb-4">
                  You can access, update, or delete your personal information through your account settings. You can also opt out of marketing communications while continuing to receive important service-related messages.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">5. Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can manage your cookie preferences through your browser settings.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">7. Changes to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date.
                </p>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy, please contact us at privacy@hairhub.com.
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

export default Privacy;
