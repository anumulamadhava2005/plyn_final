
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-salon-men/5 to-salon-women/5 dark:from-salon-men-light/5 dark:to-salon-women-light/5 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl md:text-4xl font-bold mb-4 gradient-heading"
                >
                  About HairHub
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-muted-foreground mb-8"
                >
                  Connecting customers with quality salon services since 2023
                </motion.p>
              </div>
            </div>
          </section>
          
          {/* Mission Section */}
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h2>
                  <p className="text-muted-foreground mb-6">
                    At HairHub, we believe everyone deserves to look and feel their best. Our mission
                    is to revolutionize the salon booking experience by creating a seamless platform 
                    that connects customers with skilled professionals in their area.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    We're dedicated to supporting both salon owners and customers by providing a 
                    reliable, easy-to-use service that elevates the beauty industry standard.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="rounded-lg overflow-hidden shadow-xl"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                    alt="Salon interior"
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              </div>
            </div>
          </section>
          
          {/* Team Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Team</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  We're a passionate team of developers, designers, and industry experts committed to 
                  transforming the salon booking experience.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    name: "Alex Johnson",
                    role: "Founder & CEO",
                    bio: "Former salon owner with 15 years of experience in the beauty industry",
                    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    name: "Sarah Williams",
                    role: "Head of Merchant Relations",
                    bio: "Beauty industry consultant helping salons grow their business for over a decade",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  },
                  {
                    name: "Michael Chen",
                    role: "Lead Developer",
                    bio: "Tech enthusiast passionate about creating intuitive user experiences",
                    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                  }
                ].map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                    className="glass-card p-6 rounded-lg"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <p className="text-salon-men dark:text-salon-men-light mb-2">{member.role}</p>
                      <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <div className="glass-card p-8 md:p-12 rounded-xl text-center">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl md:text-3xl font-bold mb-4"
                >
                  Ready to join our platform?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-muted-foreground mb-8 max-w-2xl mx-auto"
                >
                  Whether you're a salon owner looking to grow your business or a customer seeking quality
                  services, HairHub has you covered.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link to="/book-now">
                    <AnimatedButton variant="gradient" size="lg">
                      Book a Service
                    </AnimatedButton>
                  </Link>
                  <Link to="/merchant-signup">
                    <AnimatedButton variant="outline" size="lg">
                      Register as a Merchant
                    </AnimatedButton>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default About;
