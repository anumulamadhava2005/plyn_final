
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from 'lucide-react';
import { MerchantApplication } from '@/types/admin';

type ApprovedMerchantsListProps = {
  merchants: MerchantApplication[];
  isLoading: boolean;
};

const ApprovedMerchantsList: React.FC<ApprovedMerchantsListProps> = ({ merchants, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approved Merchants</CardTitle>
        <CardDescription>
          Manage approved merchant accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
            <p>Loading merchants...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No Approved Merchants</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              There are no approved merchants on the platform yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {merchants.map(merchant => (
              <Card key={merchant.id} className="overflow-hidden">
                <div className="h-1.5 w-full bg-green-500"></div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{merchant.business_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Owner: {merchant.user_profile?.username || 'Unknown'}
                  </p>
                  
                  <div className="grid grid-cols-1 gap-1 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{merchant.business_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{merchant.business_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{merchant.service_category} Salon</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovedMerchantsList;
