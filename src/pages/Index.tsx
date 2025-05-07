import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import FeatureCard from '@/components/ui/FeatureCard';
import TestimonialCard from '@/components/ui/TestimonialCard';
import FaqAccordion from '@/components/ui/FaqAccordion';
import PageTransition from '@/components/transitions/PageTransition';
import { useAuth } from '@/context/AuthContext';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Bell, 
  MapPin, 
  StarIcon, 
  Scissors, 
  ArrowRight,
  Check,
  UserCircle
} from 'lucide-react';

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    } 
  }
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [featureRef, featureInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const featureControls = useAnimation();

  const [howItWorksRef, howItWorksInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const howItWorksControls = useAnimation();

  const [testimonialRef, testimonialInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const testimonialControls = useAnimation();

  useEffect(() => {
    if (featureInView) {
      featureControls.start("visible");
    }
    if (howItWorksInView) {
      howItWorksControls.start("visible");
    }
    if (testimonialInView) {
      testimonialControls.start("visible");
    }
  }, [featureInView, howItWorksInView, testimonialInView, featureControls, howItWorksControls, testimonialControls]);

  const features = [
    {
      title: "Real-time Booking",
      description: "Book appointments instantly with real-time slot availability updates.",
      icon: <Calendar className="w-5 h-5" />,
      variant: "men"
    },
    {
      title: "Dynamic Slots",
      description: "Smart slot management adjusts based on service duration and availability.",
      icon: <Clock className="w-5 h-5" />,
      variant: "women"
    },
    {
      title: "Secure Payments",
      description: "Pay safely for your appointments with integrated payment solutions.",
      icon: <CreditCard className="w-5 h-5" />,
      variant: "men"
    },
    {
      title: "Appointment Reminders",
      description: "Receive notifications 10-15 minutes before your appointment.",
      icon: <Bell className="w-5 h-5" />,
      variant: "women"
    },
    {
      title: "Nearby Salons",
      description: "Find salons within a 10-15 minute radius of your location.",
      icon: <MapPin className="w-5 h-5" />,
      variant: "men"
    },
    {
      title: "Ratings & Reviews",
      description: "Read and leave reviews for salons and services.",
      icon: <StarIcon className="w-5 h-5" />,
      variant: "women"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Regular Customer",
      content: "PLYN has completely changed how I book salon appointments. The real-time updates and reminders are incredibly helpful.",
      rating: 5,
      variant: "user"
    },
    {
      name: "Michael Chen",
      role: "Salon Owner",
      content: "As a salon owner, PLYN has helped me optimize my schedule and increase my bookings by 40%. The dynamic slot management is brilliant.",
      rating: 5,
      variant: "merchant"
    },
    {
      name: "Jessica Williams",
      role: "Busy Professional",
      content: "I love the nearby salon feature. I can find available slots at quality salons within minutes from my office.",
      rating: 4,
      variant: "user"
    }
  ];

  const faqs = [
    {
      question: "How do I book an appointment through PLYN?",
      answer: "Simply create an account, search for salons near you, select your preferred services, choose an available time slot, and confirm your booking with payment."
    },
    {
      question: "Can I cancel or reschedule my appointment?",
      answer: "Yes, you can cancel or reschedule through the app up to 2 hours before your appointment without any cancellation fee."
    },
    {
      question: "How does the dynamic slot system work?",
      answer: "Our smart system allocates slots based on service duration, barber availability, and real-time updates. If a slot opens up earlier, you'll be notified about the option to move your appointment forward."
    },
    {
      question: "How do I join PLYN as a salon owner?",
      answer: "Click on 'Join as Merchant' to start the simple registration process. You'll need to provide your salon details, services offered, and complete verification. Our team will guide you through the setup."
    },
    {
      question: "How are payments processed?",
      answer: "We use secure payment processing through Stripe/Razorpay. Payments are held until the service is completed, and salon owners can withdraw funds regularly."
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <section className="relative min-h-screen flex items-center pt-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-salon-men/5 to-transparent dark:from-salon-men-light/5 z-0" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-tr from-salon-women/5 to-transparent dark:from-salon-women-light/5 z-0" />
          </div>
          
          <div className="container mx-auto px-4 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInVariants}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                    Revolutionizing Salon Bookings
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-heading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                >
                  Effortless Salon Bookings <br /> & Management
                </motion.h1>
                
                <motion.p 
                  className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                >
                  Real-time bookings, smart slot management, and seamless payments. 
                  The perfect solution for both customers and salon owners.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                >
                  <Link to="/book-now">
                    <AnimatedButton 
                      variant="gradient" 
                      size="lg" 
                      anim="shine"
                      icon={<Scissors className="w-5 h-5" />}
                    >
                      Book Now
                    </AnimatedButton>
                  </Link>
                  <Link to={user ? '/profile' : '/auth'}>
                    <AnimatedButton 
                      variant="outline" 
                      size="lg"
                      icon={<UserCircle className="w-5 h-5" />}
                    >
                      {user ? 'My Profile' : 'Sign In'}
                    </AnimatedButton>
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="aspect-square max-w-lg mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-salon-men/20 to-salon-women/20 dark:from-salon-men-light/20 dark:to-salon-women-light/20 rounded-3xl animate-pulse-slow"></div>
                  <div className="glass-card h-full w-full overflow-hidden rounded-3xl">
                    <img 
                      src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                      alt="Salon Booking" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 glass-card p-4 backdrop-blur-md rounded-xl shadow-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-salon-men dark:bg-salon-men-light text-white flex items-center justify-center">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Haircut & Styling</p>
                        <p className="text-xs text-muted-foreground">Confirmed • 3:30 PM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -top-4 -right-4 glass-card p-4 backdrop-blur-md rounded-xl shadow-lg animate-float">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-salon-women dark:bg-salon-women-light text-white flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Appointment Reminder</p>
                        <p className="text-xs text-muted-foreground">In 15 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section ref={featureRef} className="section-padding bg-secondary/30 dark:bg-dark-bg">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate={featureControls}
              variants={fadeInVariants}
            >
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the powerful features that make PLYN the ultimate salon booking platform
                for both customers and salon owners.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate={featureControls}
              variants={staggerVariants}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInVariants}>
                  <FeatureCard 
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    variant={feature.variant as 'men' | 'women' | 'default'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        <section ref={howItWorksRef} className="section-padding">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate={howItWorksControls}
              variants={fadeInVariants}
            >
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process makes booking and managing salon appointments effortless.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden"
                animate={howItWorksControls}
                variants={fadeInVariants}
                className="order-2 lg:order-1"
              >
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-6 border-l-2 border-dashed border-salon-men/30 dark:border-salon-men-light/30" />
                    
                    {[
                      {
                        step: "Search & Discover",
                        description: "Find nearby salons based on your location, preferences, and real-time availability."
                      },
                      {
                        step: "Choose Services",
                        description: "Select from a variety of services, with transparent pricing and duration information."
                      },
                      {
                        step: "Book & Pay",
                        description: "Secure your appointment with integrated payment and get instant confirmation."
                      },
                      {
                        step: "Enjoy & Review",
                        description: "Get reminders, enjoy your service, and leave a review to help others."
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="relative flex items-start gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={howItWorksControls}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { 
                            opacity: 1, 
                            x: 0,
                            transition: { 
                              duration: 0.5,
                              delay: 0.1 * index,
                              ease: [0.22, 1, 0.36, 1]
                            } 
                          }
                        }}
                      >
                        <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-salon-men dark:bg-salon-men-light text-white font-semibold">
                          {index + 1}
                        </div>
                        <div className="pt-1">
                          <h3 className="font-medium text-lg mb-1">{item.step}</h3>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={howItWorksControls}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { 
                    opacity: 1, 
                    scale: 1,
                    transition: { 
                      duration: 0.7,
                      ease: "easeOut"
                    } 
                  }
                }}
                className="order-1 lg:order-2"
              >
                <div className="relative mx-auto max-w-md">
                  <div className="aspect-[9/16] rounded-3xl overflow-hidden glass-card">
                    <img 
                      src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                      alt="Mobile App" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="absolute -left-4 top-1/4 glass-card p-3 rounded-lg animate-float">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-salon-men text-white flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Nearby Salons</span>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 top-2/3 glass-card p-3 rounded-lg animate-float" style={{ animationDelay: "1s" }}>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-salon-women text-white flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">Book Instantly</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="section-padding bg-gradient-to-br from-salon-men/5 to-salon-women/5 dark:from-salon-men-light/5 dark:to-salon-women-light/5">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-video max-w-lg rounded-3xl overflow-hidden glass-card">
                  <img 
                    src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                    alt="Salon Dashboard" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute -bottom-4 -right-4 glass-card p-4 rounded-xl shadow-lg max-w-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-salon-women dark:bg-salon-women-light text-white flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Daily Revenue</p>
                      <p className="text-2xl font-bold">$1,248.50</p>
                      <p className="text-xs text-green-500">↑ 12% from yesterday</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-salon-women/10 text-salon-women dark:bg-salon-women-light/10 dark:text-salon-women-light">
                  For Salon Owners
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Grow Your Business with PLYN</h2>
                <p className="text-muted-foreground mb-6">
                  Smart slot management, real-time bookings, and analytics to optimize your salon operations.
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Dynamic slot management that adapts to your pace",
                    "Real-time booking updates and notifications",
                    "Comprehensive analytics and reporting",
                    "Secure payment processing and payouts",
                    "Customer management and retention tools"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.5,
                        delay: 0.1 * index,
                        ease: "easeOut"
                      }}
                      viewport={{ once: true }}
                    >
                      <div className="w-5 h-5 rounded-full bg-salon-women/20 dark:bg-salon-women-light/20 flex items-center justify-center mt-1">
                        <Check className="w-3 h-3 text-salon-women dark:text-salon-women-light" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <Link to="/merchant-login">
                  <AnimatedButton 
                    variant="women" 
                    size="lg" 
                    anim="shine"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    Join as a Merchant
                  </AnimatedButton>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section ref={testimonialRef} className="section-padding">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate={testimonialControls}
              variants={fadeInVariants}
            >
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">What People Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear from our satisfied customers and merchants about their experience with PLYN.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              animate={testimonialControls}
              variants={staggerVariants}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={fadeInVariants}>
                  <TestimonialCard 
                    name={testimonial.name}
                    role={testimonial.role}
                    content={testimonial.content}
                    rating={testimonial.rating}
                    variant={testimonial.variant as 'user' | 'merchant'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        <section className="section-padding bg-secondary/30 dark:bg-dark-bg">
          <div className="container mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about PLYN's booking system.
              </p>
            </motion.div>
            
            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <FaqAccordion items={faqs} />
            </motion.div>
          </div>
        </section>
        
        <section className="section-padding">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-salon-men/10 to-salon-women/10 dark:from-salon-men-light/10 dark:to-salon-women-light/10 z-0" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">Ready to Transform Your Salon Experience?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers and salon owners on the PLYN platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/book-now">
                    <AnimatedButton 
                      variant="gradient" 
                      size="lg" 
                      anim="shine"
                    >
                      Book Your Appointment
                    </AnimatedButton>
                  </Link>
                  <Link to={user ? '/profile' : '/auth'}>
                    <AnimatedButton 
                      variant="outline" 
                      size="lg"
                      icon={<UserCircle className="w-5 h-5" />}
                    >
                      {user ? 'My Profile' : 'Sign In'}
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;

