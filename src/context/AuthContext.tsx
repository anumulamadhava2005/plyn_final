
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, phoneNumber?: string, age?: number, gender?: string, isMerchant?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  userProfile: { 
    username: string; 
    phoneNumber?: string; 
    age?: number; 
    gender?: string;
    isMerchant?: boolean;
  } | null;
  isMerchant: boolean;
  merchantLogin: (email: string, password: string) => Promise<void>;
  isAdmin: boolean;
  checkAndRedirectUserByRole: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ 
    username: string; 
    phoneNumber?: string; 
    age?: number; 
    gender?: string;
    isMerchant?: boolean;
  } | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Function to check user role and redirect accordingly
  const checkAndRedirectUserByRole = useCallback(() => {
    if (!user) return;
    
    const currentPath = window.location.pathname;
    
    if (isMerchant) {
      // If merchant is on non-merchant pages, redirect to merchant dashboard
      if (currentPath === '/' || 
          currentPath.includes('/book') || 
          currentPath.includes('/payment') || 
          currentPath.includes('/my-bookings') ||
          currentPath.includes('/hair-recommendation')) {
        window.location.href = '/merchant-dashboard';
      }
    } else if (isAdmin) {
      // If admin is on non-admin pages, redirect to admin dashboard
      if (!currentPath.includes('/admin') && 
          currentPath !== '/profile' && 
          currentPath !== '/auth') {
        window.location.href = '/admin-dashboard';
      }
    } else {
      // Regular users shouldn't be on merchant or admin pages
      if (currentPath.includes('/merchant-dashboard') || 
          currentPath.includes('/admin-dashboard') ||
          currentPath.includes('/merchant-signup')) {
        window.location.href = '/';
      }
    }
  }, [user, isMerchant, isAdmin]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user.id);
        } else {
          setUserProfile(null);
          setIsMerchant(false);
          setIsAdmin(false);
        }

        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been signed out successfully.",
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Session found" : "No session");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone_number, age, gender, is_merchant')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log("User profile data:", data);
      setUserProfile({
        username: data.username,
        phoneNumber: data.phone_number,
        age: data.age,
        gender: data.gender,
        isMerchant: data.is_merchant
      });
      
      setIsMerchant(data.is_merchant || false);
      
      // Check if user is an admin (email-based check for simplicity)
      // In a production app, you would have a proper roles table
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        const isAdminEmail = userData.user.email?.endsWith('@admin.plyn.com') || false;
        setIsAdmin(isAdminEmail);
      }
      
      // After profile is fetched and roles determined, redirect user based on role
      setTimeout(() => {
        checkAndRedirectUserByRole();
      }, 300);
      
      if (data.is_merchant) {
        const { data: merchantData, error: merchantError } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!merchantError && merchantData) {
          console.log('Merchant data found:', merchantData);
        } else {
          console.log('No merchant data found or error:', merchantError);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for:", email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
      
      console.log("Sign in successful:", data.user?.id);
    } catch (error: any) {
      console.error("Sign in error details:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const merchantLogin = async (email: string, password: string) => {
    try {
      console.log("Attempting merchant login for:", email);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Merchant login error:", error);
        throw error;
      }
      
      console.log("Sign in successful, checking merchant status:", data.user?.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_merchant')
        .eq('id', data.user?.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        await supabase.auth.signOut();
        throw new Error("Could not verify merchant status. Please try again.");
      }
        
      if (!profileData?.is_merchant) {
        console.error("Non-merchant attempted to log in as merchant");
        await supabase.auth.signOut();
        throw new Error("This account is not registered as a merchant. Please contact support if you believe this is an error.");
      }
      
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', data.user?.id)
        .single();
        
      if (merchantError) {
        console.error("Error fetching merchant profile:", merchantError);
      }
      
      toast({
        title: "Welcome back, Merchant!",
        description: "You've successfully signed in to your merchant account.",
      });
      
    } catch (error: any) {
      console.error("Merchant login error details:", error);
      toast({
        title: "Merchant login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    phoneNumber?: string, 
    age?: number, 
    gender?: string,
    isMerchant: boolean = false
  ) => {
    try {
      console.log("Checking if username exists:", username);
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);
        
      if (checkError) {
        console.error("Error checking username:", checkError);
        throw checkError;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        console.error("Username already exists");
        throw new Error("Username already exists. Please choose a different username.");
      }
      
      const uniqueUsername = username;
      
      console.log("Signing up user with email:", email);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: uniqueUsername,
            phone_number: phoneNumber,
            age,
            gender,
            is_merchant: isMerchant,
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }
      
      console.log("Sign up successful:", data);
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
    } catch (error: any) {
      console.error("Sign up error details:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsMerchant(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase sign out error:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      userProfile, 
      isMerchant,
      merchantLogin,
      isAdmin,
      checkAndRedirectUserByRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
