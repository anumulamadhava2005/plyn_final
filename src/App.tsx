
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import BookNow from "./pages/BookNow";
import SalonDetails from "./pages/SalonDetails";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MerchantSignup from "./pages/MerchantSignup";
import MerchantDashboard from "./pages/MerchantDashboard";
import MerchantAuth from "./pages/MerchantAuth";
import MerchantPending from "./pages/MerchantPending";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import MyBookings from "./pages/MyBookings";
import HairRecommendation from "./pages/HairRecommendation";

const queryClient = new QueryClient();

// Route Guard Components
const MerchantRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isMerchant, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  if (!isMerchant) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isMerchant, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" replace />;
  if (isMerchant) return <Navigate to="/merchant-dashboard" replace />;
  if (isAdmin) return <Navigate to="/admin-dashboard" replace />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isMerchant, isAdmin, checkAndRedirectUserByRole } = useAuth();
  
  // Apply role-based redirections when routes component mounts
  React.useEffect(() => {
    if (user) {
      checkAndRedirectUserByRole();
    }
  }, [user, isMerchant, isAdmin, checkAndRedirectUserByRole]);
  
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/merchant-login" element={<MerchantAuth />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Merchant routes */}
        <Route path="/merchant-dashboard" element={
          <MerchantRoute>
            <MerchantDashboard />
          </MerchantRoute>
        } />
        <Route path="/merchant-signup" element={
          <MerchantRoute>
            <MerchantSignup />
          </MerchantRoute>
        } />
        <Route path="/merchant-pending" element={
          <MerchantRoute>
            <MerchantPending />
          </MerchantRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Customer routes */}
        <Route path="/" element={<Index />} />
        <Route path="/book-now" element={<BookNow />} />
        <Route path="/book/:id" element={<SalonDetails />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/hair-recommendation" element={<HairRecommendation />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
