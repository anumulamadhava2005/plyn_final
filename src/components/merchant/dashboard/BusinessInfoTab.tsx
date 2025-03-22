
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { MerchantData } from '@/types/merchant';

interface BusinessInfoTabProps {
  merchantData: MerchantData | null;
}

const BusinessInfoTab: React.FC<BusinessInfoTabProps> = ({ merchantData }) => {
  if (!merchantData) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Review and update your business details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input 
                id="business_name" 
                value={merchantData.business_name} 
                readOnly 
                className="mt-1 bg-muted" 
              />
            </div>
            <div>
              <Label htmlFor="service_category">Service Category</Label>
              <Input 
                id="service_category" 
                value={`${merchantData.service_category.charAt(0).toUpperCase() + merchantData.service_category.slice(1)} Salon`} 
                readOnly 
                className="mt-1 bg-muted" 
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="business_address">Address</Label>
            <Input 
              id="business_address" 
              value={merchantData.business_address} 
              readOnly 
              className="mt-1 bg-muted" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_email">Email</Label>
              <Input 
                id="business_email" 
                value={merchantData.business_email} 
                readOnly 
                className="mt-1 bg-muted" 
              />
            </div>
            <div>
              <Label htmlFor="business_phone">Phone</Label>
              <Input 
                id="business_phone" 
                value={merchantData.business_phone} 
                readOnly 
                className="mt-1 bg-muted" 
              />
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              To update your business information, please contact support.
            </p>
            
            <Button disabled variant="outline" className="w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Request Information Update
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoTab;
