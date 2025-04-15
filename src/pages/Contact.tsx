
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageTransition from '@/components/transitions/PageTransition';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Navbar />
          
          <main className="flex-1 py-8 px-4 md:px-8 mt-16">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">Contact Us</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Get in Touch</h2>
                  <p className="text-muted-foreground mb-8">
                    Have questions or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Email</h3>
                        <p className="text-sm text-muted-foreground">support@hairhub.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Phone</h3>
                        <p className="text-sm text-muted-foreground">(123) 456-7890</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">Address</h3>
                        <p className="text-sm text-muted-foreground">123 Beauty Lane, Suite 100<br />San Francisco, CA 94103</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <form className="space-y-6 bg-card p-6 rounded-lg border border-border">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</label>
                      <Input id="name" placeholder="Your name" className="bg-background" />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                      <Input id="email" type="email" placeholder="Your email" className="bg-background" />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">Subject</label>
                      <Input id="subject" placeholder="Subject" className="bg-background" />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Message</label>
                      <Textarea id="message" placeholder="Your message" rows={5} className="bg-background" />
                    </div>
                    
                    <Button className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
