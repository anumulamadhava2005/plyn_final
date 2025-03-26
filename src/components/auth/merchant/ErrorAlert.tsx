
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorAlertProps {
  error: string | null;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
