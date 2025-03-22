
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from 'lucide-react';

type UserProfile = {
  username: string | null;
  email: string | null;
};

type MerchantApplicationProps = {
  id: string;
  business_name: string;
  business_address: string;
  business_email: string;
  business_phone: string;
  service_category: string;
  created_at: string;
  user_profile: UserProfile | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

const MerchantApplicationCard: React.FC<MerchantApplicationProps> = ({
  id,
  business_name,
  business_address,
  business_email,
  business_phone,
  service_category,
  created_at,
  user_profile,
  onApprove,
  onReject
}) => {
  return (
    <Card key={id} className="overflow-hidden">
      <div className="h-1.5 w-full bg-orange-500"></div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{business_name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Owner: {user_profile?.username || 'Unknown'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
              <div>
                <span className="block text-muted-foreground">Email</span>
                <span>{business_email}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Phone</span>
                <span>{business_phone}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Address</span>
                <span>{business_address}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Service Category</span>
                <span className="capitalize">{service_category} Salon</span>
              </div>
            </div>
            
            <div className="mt-4">
              <span className="block text-muted-foreground text-sm">Application Date</span>
              <span className="text-sm">
                {new Date(created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 md:min-w-32">
            <Button
              onClick={() => onApprove(id)}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              onClick={() => onReject(id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MerchantApplicationCard;
