
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Check, Users, Briefcase } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Navbar />
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Sidebar />

            <div>
              {/* Hero Section */}
              <section className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 py-16">
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto text-center" style={{ paddingTop: 100 }}>
                    <motion.h1
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-3xl md:text-4xl font-bold mb-4 text-foreground dark:text-white"
                    >
                      About PLYN
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-muted-foreground dark:text-muted-foreground/80 mb-8"
                    >
                      India's go-to platform for discovering and booking personal care and wellness services
                    </motion.p>
                  </div>
                </div>
              </section>

              {/* Sections with alternating image placement */}
              {[
                {
                  title: "Empowering Local Businesses",
                  description: "We believe that every stylist, beautician, and wellness expert deserves the tools to grow. That's why PLYN supports small and medium businesses with a complete, easy-to-use digital solution.",
                  image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                  icon: Briefcase,
                  reverse: false
                },
                {
                  title: "Making Booking Seamless",
                  description: "No more calling, waiting, or double-booking. PLYN helps customers explore top-rated services, check real-time availability, and book instantly — anytime, anywhere.",
                  image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                  icon: Check,
                  reverse: true
                },
                {
                  title: "Community First",
                  description: "We're more than just a booking app — we're a growing community of beauty and wellness lovers and professionals. From Tier 1 cities to small towns, we're on a mission to digitize India's self-care industry.",
                  image: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                  icon: Users,
                  reverse: false
                }
              ].map((section, index) => (
                <section
                  key={index}
                  className={`py-16 px-4 ${index % 2 === 0 ? 'bg-secondary/10 dark:bg-secondary/5' : ''}`}
                >
                  <div className="container mx-auto">
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${section.reverse ? 'lg:flex-row-reverse' : ''}`}>
                      <motion.div
                        initial={{ opacity: 0, x: section.reverse ? 30 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`order-2 ${section.reverse ? 'lg:order-1' : 'lg:order-2'}`}
                      >
                        <div className="flex items-center mb-6">
                          <section.icon className="mr-4 w-8 h-8 text-primary dark:text-primary/80" />
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">
                            {section.title}
                          </h2>
                        </div>
                        <p className="text-muted-foreground dark:text-muted-foreground/80 mb-6">
                          {section.description}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: section.reverse ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`rounded-lg overflow-hidden shadow-xl ${section.reverse ? 'order-1 lg:order-2' : 'order-2 lg:order-1'}`}
                      >
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-auto object-cover"
                        />
                      </motion.div>
                    </div>
                  </div>
                </section>
              ))}

              {/* Why PLYN Section */}
              <section className="py-16 px-4 bg-secondary/10 dark:bg-secondary/5">
                <div className="container mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                  >
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground dark:text-white">
                      Why PLYN?
                    </h2>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      {
                        icon: Star,
                        title: "Smart Scheduling",
                        description: "Real-time availability, instant booking, and smooth cancellations."
                      },
                      {
                        icon: Heart,
                        title: "Verified Professionals",
                        description: "Only trusted and reviewed service providers."
                      },
                      {
                        icon: Check,
                        title: "Rewards & Offers",
                        description: "Enjoy exclusive deals and loyalty benefits."
                      },
                      {
                        icon: Users,
                        title: "Secure Payments",
                        description: "Pay safely via UPI, card, or cash at the venue."
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                        className="bg-white dark:bg-secondary/10 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
                      >
                        <feature.icon className="mx-auto mb-4 w-12 h-12 text-primary dark:text-primary/80" />
                        <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground dark:text-muted-foreground/80">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-16 px-4">
                <div className="container mx-auto">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-8 md:p-12 rounded-xl text-center">
                    <motion.h2
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-2xl md:text-3xl font-bold mb-4 text-foreground dark:text-white"
                    >
                      Ready to join our platform?
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-muted-foreground dark:text-muted-foreground/80 mb-8 max-w-2xl mx-auto"
                    >
                      Whether you're a salon owner looking to grow your business or a customer seeking quality services, PLYN has you covered.
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
                          Register Your Business
                        </AnimatedButton>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default About;
