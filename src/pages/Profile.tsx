
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CreditCard, HelpCircle, LogOut, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateUserCoins } from '@/utils/userUtils';
// Import getUserCoins from userUtils
import { getUserCoins, getUserProfile } from '@/utils/userUtils';
import PageTransition from '@/components/transitions/PageTransition';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coins, setCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userCoins = await getUserCoins(user.id);
          setCoins(userCoins);
          
          const userProfile = await getUserProfile(user.id);
          setProfile(userProfile);
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfileData();
  }, [user, toast]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddCoins = async () => {
    if (!user) return;
    
    const newCoins = coins + 100;
    const success = await updateUserCoins(user.id, newCoins);
    
    if (success) {
      setCoins(newCoins);
      toast({
        title: "Coins Added",
        description: "Successfully added 100 coins to your account.",
      });
    } else {
      toast({
        title: "Failed to Add Coins",
        description: "Failed to update coins. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto py-12">
        <Card className="shadow-md rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
              <LogOut className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{profile?.full_name || 'User'}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
              
              <div className="grid gap-2">
                <p className="text-lg font-semibold">Account Balance</p>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{coins} Coins</span>
                  <Button variant="secondary" size="sm" onClick={handleAddCoins}>
                    Add Coins
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <p className="text-lg font-semibold">Settings</p>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="ghost" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  My Bookings
                </Button>
                <Button variant="ghost" className="justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Profile;
