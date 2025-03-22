
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Analytics</CardTitle>
        <CardDescription>
          Overview of platform performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-center py-16 px-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Comprehensive analytics feature coming soon.
            </p>
            <Button variant="outline" disabled>Coming Soon</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
