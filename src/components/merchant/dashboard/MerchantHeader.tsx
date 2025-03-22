
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Scissors, Users } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Calendar } from 'lucide-react';
import { MerchantData } from '@/types/merchant';

interface MerchantHeaderProps {
  merchantData: MerchantData | null;
  userProfile: { username: string } | null;
  slotsCount: number;
  bookingsCount: number;
  refreshData: () => void;
}

const MerchantHeader: React.FC<MerchantHeaderProps> = ({
  merchantData,
  userProfile,
  slotsCount,
  bookingsCount,
  refreshData
}) => {
  if (!merchantData) return null;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-heading">Merchant Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your bookings, availability, and business profile
          </p>
        </div>
        
        <AnimatedButton 
          variant="outline" 
          onClick={refreshData}
          icon={<Calendar className="w-4 h-4 mr-2" />}
        >
          Refresh Data
        </AnimatedButton>
      </div>
      
      <div className="mb-8">
        <Card className="bg-salon-women/5 dark:bg-salon-women-light/5 border-salon-women/20 dark:border-salon-women-light/20">
          <CardHeader className="pb-3">
            <CardTitle>{merchantData.business_name}</CardTitle>
            <CardDescription>
              {merchantData.service_category.charAt(0).toUpperCase() + merchantData.service_category.slice(1)} Salon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userProfile?.username || 'Owner'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{slotsCount} Time Slots Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{bookingsCount} Total Bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantHeader;
