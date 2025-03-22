import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import SalonCard from '@/components/booking/SalonCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { initializeDatabase } from '@/utils/bookingUtils';

// Mock data for salons
const salonData = [
  {
    id: "1",
    name: "Modern Cuts",
    rating: 4.8,
    reviewCount: 204,
    address: "123 Broadway St, New York, NY",
    distance: "0.8 mi",
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    services: [
      { name: "Men's Haircut", price: 35, duration: 30 },
      { name: "Beard Trim", price: 15, duration: 15 },
      { name: "Hair Wash & Style", price: 25, duration: 20 },
      { name: "Hot Towel Shave", price: 30, duration: 25 }
    ],
    openingTime: "9:00 AM",
    closingTime: "7:00 PM",
    featured: true,
    type: "men"
  },
  {
    id: "2",
    name: "Elegance Hair Studio",
    rating: 4.6,
    reviewCount: 178,
    address: "456 5th Avenue, New York, NY",
    distance: "1.2 mi",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    services: [
      { name: "Women's Haircut", price: 55, duration: 45 },
      { name: "Blow Dry & Style", price: 40, duration: 30 },
      { name: "Hair Coloring", price: 95, duration: 90 },
      { name: "Deep Conditioning", price: 35, duration: 30 }
    ],
    openingTime: "8:00 AM",
    closingTime: "8:00 PM",
    featured: false,
    type: "women"
  },
  {
    id: "3",
    name: "The Barber Room",
    rating: 4.9,
    reviewCount: 312,
    address: "789 Washington St, New York, NY",
    distance: "0.5 mi",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    services: [
      { name: "Premium Haircut", price: 45, duration: 40 },
      { name: "Beard Styling", price: 25, duration: 20 },
      { name: "Full Service", price: 65, duration: 60 },
      { name: "Kid's Haircut", price: 25, duration: 20 }
    ],
    openingTime: "10:00 AM",
    closingTime: "9:00 PM",
    featured: true,
    type: "men"
  },
  {
    id: "4",
    name: "Beauty & Beyond",
    rating: 4.7,
    reviewCount: 156,
    address: "321 Madison Ave, New York, NY",
    distance: "1.5 mi",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    services: [
      { name: "Women's Cut & Style", price: 60, duration: 50 },
      { name: "Manicure", price: 35, duration: 30 },
      { name: "Pedicure", price: 45, duration: 40 },
      { name: "Facial", price: 75, duration: 60 }
    ],
    openingTime: "9:00 AM",
    closingTime: "7:00 PM",
    featured: false,
    type: "women"
  },
  {
    id: "5",
    name: "Unisex Style Studio",
    rating: 4.5,
    reviewCount: 124,
    address: "555 Lexington Ave, New York, NY",
    distance: "0.9 mi",
    image: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    services: [
      { name: "Men's Haircut", price: 40, duration: 35 },
      { name: "Women's Haircut", price: 55, duration: 45 },
      { name: "Styling", price: 35, duration: 30 },
      { name: "Color Treatment", price: 85, duration: 90 }
    ],
    openingTime: "8:30 AM",
    closingTime: "8:30 PM",
    featured: false,
    type: "unisex"
  },
  {
    id: "6",
    name: "The Hair Lounge",
    rating: 4.4,
    reviewCount: 98,
    address: "888 Park Ave, New York, NY",
    distance: "2.1 mi",
    image: "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    services: [
      { name: "Premium Cut", price: 50, duration: 45 },
      { name: "Hair Treatment", price: 70, duration: 60 },
      { name: "Bridal Styling", price: 120, duration: 120 },
      { name: "Extensions", price: 200, duration: 180 }
    ],
    openingTime: "10:00 AM",
    closingTime: "6:00 PM",
    featured: false,
    type: "unisex"
  }
];

const BookNow = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [distance, setDistance] = useState([5]);
  const [salonType, setSalonType] = useState("all");
  const [filteredSalons, setFilteredSalons] = useState(salonData);
  const [showFilters, setShowFilters] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      if (!dbInitialized) {
        try {
          const result = await initializeDatabase();
          console.log('Database initialization result:', result);
          setDbInitialized(true);
        } catch (error) {
          console.error('Failed to initialize database:', error);
        }
      }
    };
    
    initDb();

    const channel = supabase
      .channel('merchant-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'merchants'
        },
        () => {
          // For now, we're still using mock data so no action needed
          // In a real application, this would fetch the latest merchant data
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dbInitialized]);

  const handleSearch = () => {
    let results = salonData;
    
    if (searchTerm) {
      results = results.filter(salon => 
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.services.some(service => service.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    results = results.filter(salon => {
      const salonDistance = parseFloat(salon.distance.replace(" mi", ""));
      return salonDistance <= distance[0];
    });
    
    if (salonType !== "all") {
      results = results.filter(salon => salon.type === salonType);
    }
    
    setFilteredSalons(results);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20">
          <section className="bg-gradient-to-r from-salon-men/5 to-salon-women/5 dark:from-salon-men-light/5 dark:to-salon-women-light/5 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl md:text-4xl font-bold mb-4 gradient-heading"
                >
                  Find and Book the Perfect Salon
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-muted-foreground mb-8"
                >
                  Discover nearby salons with real-time availability and instant booking
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="Search by salon, service, or location"
                        className="pl-10 h-12 rounded-lg bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <AnimatedButton
                      variant="gradient"
                      size="lg"
                      className="md:w-auto"
                      onClick={handleSearch}
                      icon={<Search className="w-4 h-4" />}
                    >
                      Search
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      size="icon"
                      className="md:w-12 h-12"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-5 h-5" />
                    </AnimatedButton>
                  </div>
                  
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 bg-background dark:bg-dark-card border border-border rounded-lg shadow-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="mb-2 block">Distance (miles)</Label>
                          <div className="flex flex-col space-y-2">
                            <Slider
                              value={distance}
                              min={1}
                              max={10}
                              step={0.5}
                              onValueChange={setDistance}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>1 mi</span>
                              <span>{distance[0]} mi</span>
                              <span>10 mi</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Salon Type</Label>
                          <RadioGroup 
                            value={salonType} 
                            onValueChange={setSalonType}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="all" 
                                id="all"
                                className="text-primary"
                              />
                              <Label htmlFor="all">All</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="men" 
                                id="men"
                                className="text-salon-men dark:text-salon-men-light"
                              />
                              <Label htmlFor="men">Men</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="women" 
                                id="women"
                                className="text-salon-women dark:text-salon-women-light"
                              />
                              <Label htmlFor="women">Women</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="unisex" 
                                id="unisex"
                              />
                              <Label htmlFor="unisex">Unisex</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <AnimatedButton
                          variant="default"
                          size="sm"
                          onClick={handleSearch}
                        >
                          Apply Filters
                        </AnimatedButton>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </section>
          
          <section className="py-12 px-4">
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {filteredSalons.length} Salons Available
                </h2>
                <div className="text-sm text-muted-foreground">
                  Showing results within {distance[0]} miles
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((salon, index) => (
                  <motion.div
                    key={salon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <SalonCard
                      id={salon.id}
                      name={salon.name}
                      rating={salon.rating}
                      reviewCount={salon.reviewCount}
                      address={salon.address}
                      distance={salon.distance}
                      image={salon.image}
                      services={salon.services}
                      openingTime={salon.openingTime}
                      closingTime={salon.closingTime}
                      featured={salon.featured}
                      type={salon.type as 'men' | 'women' | 'unisex'}
                    />
                  </motion.div>
                ))}
              </div>
              
              {filteredSalons.length === 0 && (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                  >
                    <Search className="w-16 h-16 mx-auto text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-medium mb-2">No salons found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria or expanding the distance
                  </p>
                  <AnimatedButton
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setDistance([5]);
                      setSalonType("all");
                      setFilteredSalons(salonData);
                    }}
                  >
                    Reset Search
                  </AnimatedButton>
                </div>
              )}
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default BookNow;
