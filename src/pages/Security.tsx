
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';

const Security = () => {
  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <main className="flex-1 py-8 px-4 md:px-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">Security</h1>
              
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <p className="text-muted-foreground mb-8">
                  At HairHub, we take the security of your data seriously. Here's how we protect your information:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-accent/30 p-6 rounded-lg border border-border">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Data Encryption</h3>
                    <p className="text-muted-foreground">
                      All data transmitted between your browser and our servers is encrypted using industry-standard TLS/SSL protocols.
                    </p>
                  </div>
                  
                  <div className="bg-accent/30 p-6 rounded-lg border border-border">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Secure Authentication</h3>
                    <p className="text-muted-foreground">
                      We use strong authentication methods and regularly update our security procedures to keep your account safe.
                    </p>
                  </div>
                  
                  <div className="bg-accent/30 p-6 rounded-lg border border-border">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Payment Security</h3>
                    <p className="text-muted-foreground">
                      All payment processing is handled by trusted third-party providers that comply with PCI DSS standards.
                    </p>
                  </div>
                  
                  <div className="bg-accent/30 p-6 rounded-lg border border-border">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Regular Security Audits</h3>
                    <p className="text-muted-foreground">
                      We conduct regular security audits and vulnerability assessments to identify and address potential security issues.
                    </p>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">Security Best Practices</h2>
                <p className="text-muted-foreground mb-4">
                  While we do our part to keep your data secure, here are some steps you can take to protect your account:
                </p>
                
                <ul className="list-disc pl-6 mb-8 text-muted-foreground">
                  <li className="mb-2">Use a strong, unique password for your HairHub account</li>
                  <li className="mb-2">Enable two-factor authentication when available</li>
                  <li className="mb-2">Log out of your account when using shared devices</li>
                  <li className="mb-2">Keep your device's operating system and browser up to date</li>
                  <li className="mb-2">Be cautious of phishing attempts - we will never ask for your password via email</li>
                </ul>
                
                <h2 className="text-xl font-semibold text-foreground mt-6 mb-4">Reporting Security Issues</h2>
                <p className="text-muted-foreground mb-4">
                  If you believe you've discovered a security vulnerability in our platform, please email us at security@hairhub.com. We appreciate your help in keeping HairHub secure.
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

export default Security;
