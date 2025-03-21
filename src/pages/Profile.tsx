
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/transitions/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { UserCircle, Mail, Phone, Calendar, Users, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page if not logged in
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user || !userProfile) {
    return null; // Will redirect via useEffect
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 gradient-heading">Your Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-salon-men to-salon-women rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-2">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </div>
                  <CardTitle className="text-xl">{userProfile.username}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <AnimatedButton 
                    variant="destructive" 
                    className="w-full mt-4"
                    icon={<LogOut className="w-4 h-4" />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </AnimatedButton>
                </CardContent>
              </Card>
              
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <UserCircle className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Username</p>
                      <p className="text-muted-foreground">{userProfile.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  {userProfile.phoneNumber && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone Number</p>
                        <p className="text-muted-foreground">{userProfile.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  {userProfile.age && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Age</p>
                        <p className="text-muted-foreground">{userProfile.age}</p>
                      </div>
                    </div>
                  )}
                  
                  {userProfile.gender && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Gender</p>
                        <p className="text-muted-foreground">
                          {userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Profile;
