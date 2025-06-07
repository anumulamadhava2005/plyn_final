/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { getMerchantSettings, upsertMerchantSettings } from '@/utils/workerUtils';
import { connectRazorpayLinkedAccount } from '@/utils/razorpayUtils';

interface MerchantSettingsManagerProps {
  merchantId: string;
  onSettingsUpdated?: () => void;
}

const MerchantSettingsManager: React.FC<MerchantSettingsManagerProps> = ({ merchantId, onSettingsUpdated }) => {
  const [settings, setSettings] = useState<any>({
    merchant_id: merchantId,
    total_workers: 1,
    working_hours_start: '09:00',
    working_hours_end: '17:00',
    break_start: '',
    break_end: '',
    worker_assignment_strategy: 'next-available',
    razorpay_id: '',
    legal_business_name: '',
    contact_name: '',
    business_type: 'partnership',
    business_email: '',
    business_phone: '',
    pan: '',
    gst: '',
    registered_address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'IN',
    },
    // Bank fields
    ifsc_code: '',
    bank_name: '',
    branch: '',
    account_number: '',
    confirm_account_number: '',
    account_holder_name: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [merchantId]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getMerchantSettings(merchantId);
      if (data) {
        setSettings((prev: any) => ({
          ...prev,
          ...data,
          registered_address: data.registered_address || prev.registered_address,
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message || "Failed to load merchant settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIFSCDetails = async (ifsc: string) => {
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (!response.ok) throw new Error('Invalid IFSC Code');
      const data = await response.json();
      setSettings((prev: any) => ({
        ...prev,
        bank_name: data.BANK,
        branch: data.BRANCH,
      }));
    } catch (error) {
      toast({
        title: "Invalid IFSC Code",
        description: "Could not fetch bank details. Please check the IFSC code.",
        variant: "destructive",
      });
      setSettings((prev: any) => ({
        ...prev,
        bank_name: '',
        branch: '',
      }));
    }
  };

  const handleSaveSettings = async () => {
    if (settings.account_number !== settings.confirm_account_number) {
      toast({
        title: "Account Numbers Don't Match",
        description: "Please ensure both account numbers are the same.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await upsertMerchantSettings(merchantId, {
        ...settings,
        break_start: settings.break_start || null,
        break_end: settings.break_end || null,
      });

      toast({
        title: "Settings Saved",
        description: "Your merchant settings have been updated successfully",
      });

      onSettingsUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save merchant settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      registered_address: {
        ...prev.registered_address,
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <Card className="bg-black/80 border-border/20">
        <CardHeader><CardTitle>Business Settings</CardTitle></CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/80 border-border/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings2 className="h-5 w-5 mr-2" />
          Business Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Worker & Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalWorkers">Number of Workers</Label>
            <Select
              value={settings.total_workers.toString()}
              onValueChange={(value) => handleChange('total_workers', parseInt(value))}
            >
              <SelectTrigger><SelectValue placeholder="Select number of workers" /></SelectTrigger>
              <SelectContent>{[...Array(10)].map((_, i) => <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Assignment Strategy</Label>
            <Select
              value={settings.worker_assignment_strategy}
              onValueChange={(value) => handleChange('worker_assignment_strategy', value)}
            >
              <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="next-available">Next Available</SelectItem>
                <SelectItem value="round-robin">Round Robin</SelectItem>
                <SelectItem value="specialty">By Specialty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input type="time" value={settings.working_hours_start} onChange={(e) => handleChange('working_hours_start', e.target.value)} placeholder="Start Time" />
          <Input type="time" value={settings.working_hours_end} onChange={(e) => handleChange('working_hours_end', e.target.value)} placeholder="End Time" />
          <Input type="time" value={settings.break_start} onChange={(e) => handleChange('break_start', e.target.value)} placeholder="Break Start" />
          <Input type="time" value={settings.break_end} onChange={(e) => handleChange('break_end', e.target.value)} placeholder="Break End" />
        </div>

        {/* Razorpay + Bank Details */}
        <div className="space-y-4 border-t pt-4">
          <Label>Razorpay & Bank Details</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Legal Business Name" value={settings.legal_business_name} onChange={(e) => handleChange('legal_business_name', e.target.value)} />
            <Input placeholder="Contact Name" value={settings.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} />
            <Input placeholder="Email" value={settings.business_email} onChange={(e) => handleChange('business_email', e.target.value)} />
            <Input placeholder="Phone" value={settings.business_phone} onChange={(e) => handleChange('business_phone', e.target.value)} />
            <Input placeholder="PAN" value={settings.pan} onChange={(e) => handleChange('pan', e.target.value)} />
            <Input placeholder="GST (optional)" value={settings.gst} onChange={(e) => handleChange('gst', e.target.value)} />

            <Select value={settings.business_type} onValueChange={(val) => handleChange('business_type', val)}>
              <SelectTrigger><SelectValue placeholder="Business Type" /></SelectTrigger>
              <SelectContent>
                {['individual', 'proprietorship', 'partnership', 'private_limited', 'public_limited', 'trust', 'society', 'ngo'].map(type => (
                  <SelectItem key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Street 1" value={settings.registered_address.street1} onChange={(e) => handleAddressChange('street1', e.target.value)} />
            <Input placeholder="Street 2" value={settings.registered_address.street2} onChange={(e) => handleAddressChange('street2', e.target.value)} />
            <Input placeholder="City" value={settings.registered_address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
            <Input placeholder="State" value={settings.registered_address.state} onChange={(e) => handleAddressChange('state', e.target.value)} />
            <Input placeholder="Postal Code" value={settings.registered_address.postal_code} onChange={(e) => handleAddressChange('postal_code', e.target.value)} />
            <Input placeholder="Country" value={settings.registered_address.country} disabled />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="pt-6 border-t space-y-4">
          <Label>Bank Details</Label>
          <Input
            placeholder="IFSC Code"
            value={settings.ifsc_code}
            onChange={(e) => {
              handleChange('ifsc_code', e.target.value.toUpperCase());
              if (e.target.value.length === 11) fetchIFSCDetails(e.target.value);
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Bank Name" value={settings.bank_name} readOnly />
            <Input placeholder="Branch" value={settings.branch} readOnly />
            <Input placeholder="Account Number" value={settings.account_number} onChange={(e) => handleChange('account_number', e.target.value)} />
            <Input placeholder="Re-enter Account Number" value={settings.confirm_account_number} onChange={(e) => handleChange('confirm_account_number', e.target.value)} />
            <Input placeholder="Account Holder Name" value={settings.account_holder_name} onChange={(e) => handleChange('account_holder_name', e.target.value)} />
          </div>
        </div>

        {/* Save + Razorpay Connect */}
        <Button className="w-full mt-6" onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Settings"}
        </Button>

        <div className="pt-4 border-t">
          <Label>Razorpay Integration</Label>
          {settings?.razorpay_id?.startsWith("acc_") ? (
            <p className="text-green-400 text-sm">✅ Razorpay linked: {settings.razorpay_id}</p>
          ) : (
            <Button
              variant="secondary"
              disabled={isSaving}
              onClick={async () => {
                if (!merchantId) return;
                setIsSaving(true);
                try {
                  const { data: merchantData, error } = await supabase
                    .from("merchants")
                    .select("*")
                    .eq("id", merchantId)
                    .single();
                  if (error || !merchantData) throw error || new Error("Merchant not found");

                  const accountId = await connectRazorpayLinkedAccount({ ...merchantData, ...settings });
                  const { error: updateError } = await supabase
                    .from("merchants")
                    .update({ razorpay_id: accountId })
                    .eq("id", merchantId);
                  if (updateError) throw updateError;

                  setSettings((prev: any) => ({ ...prev, razorpay_id: accountId }));

                  toast({ title: "Razorpay Connected", description: `Account ID: ${accountId}` });
                } catch (err: any) {
                  toast({
                    title: "Error connecting Razorpay",
                    description: err.message || "Failed to connect account",
                    variant: "destructive",
                  });
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Connecting...</> : "Connect Razorpay"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MerchantSettingsManager;