
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Bell, CreditCard, BarChart3 } from 'lucide-react';

const MerchantBenefits = () => {
  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Smart Slot Management",
      description: "Dynamic scheduling that adapts to your pace and maximizes your salon's efficiency."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Real-time Notifications",
      description: "Instant alerts for new bookings, cancellations, and customer arrivals."
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Hassle-free payment processing with same-day deposits available."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Comprehensive Analytics",
      description: "Detailed reports on revenue, customer retention, peak hours, and growth opportunities."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full bg-salon-women/10 text-salon-women dark:bg-salon-women-light/10 dark:text-salon-women-light">
        For Salon Owners
      </span>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-heading">
        Join PLYN as a Merchant
      </h1>
      <p className="text-muted-foreground mb-8">
        Grow your business with our smart booking system, real-time notifications, and comprehensive analytics.
      </p>
      
      <div className="space-y-6">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="flex gap-4"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-salon-women/10 text-salon-women dark:bg-salon-women-light/10 dark:text-salon-women-light">
              {benefit.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MerchantBenefits;
