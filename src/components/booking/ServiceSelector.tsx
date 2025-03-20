
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: string[];
  onChange: (selectedIds: string[]) => void;
  salonType: 'men' | 'women' | 'unisex';
  className?: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServices,
  onChange,
  salonType,
  className,
}) => {
  const handleToggle = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      onChange(selectedServices.filter(id => id !== serviceId));
    } else {
      onChange([...selectedServices, serviceId]);
    }
  };

  const getColorClass = () => {
    if (salonType === 'men') return 'border-salon-men bg-salon-men/5 dark:border-salon-men-light dark:bg-salon-men-light/5';
    if (salonType === 'women') return 'border-salon-women bg-salon-women/5 dark:border-salon-women-light dark:bg-salon-women-light/5';
    return 'border-primary bg-primary/5 dark:border-primary dark:bg-primary/5';
  };

  const getSelectedColorClass = () => {
    if (salonType === 'men') return 'border-salon-men bg-salon-men/10 dark:border-salon-men-light dark:bg-salon-men-light/10';
    if (salonType === 'women') return 'border-salon-women bg-salon-women/10 dark:border-salon-women-light dark:bg-salon-women-light/10';
    return 'border-primary bg-primary/10 dark:border-primary dark:bg-primary/10';
  };

  const getCheckboxColorClass = () => {
    if (salonType === 'men') return 'border-salon-men text-salon-men dark:border-salon-men-light dark:text-salon-men-light';
    if (salonType === 'women') return 'border-salon-women text-salon-women dark:border-salon-women-light dark:text-salon-women-light';
    return 'border-primary text-primary dark:border-primary dark:text-primary';
  };

  return (
    <div className={cn("space-y-2", className)}>
      {services.map((service) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => handleToggle(service.id)}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-all duration-200",
            selectedServices.includes(service.id) 
              ? getSelectedColorClass()
              : getColorClass()
          )}
        >
          <div className="flex items-start">
            <div 
              className={cn(
                "w-5 h-5 mr-3 mt-0.5 rounded border flex items-center justify-center",
                selectedServices.includes(service.id) 
                  ? getCheckboxColorClass() 
                  : "border-muted-foreground"
              )}
            >
              {selectedServices.includes(service.id) && (
                <Check className="w-3 h-3" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{service.name}</h4>
                <div className="text-right">
                  <span className="font-semibold">${service.price}</span>
                  <p className="text-xs text-muted-foreground">{service.duration} min</p>
                </div>
              </div>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ServiceSelector;
