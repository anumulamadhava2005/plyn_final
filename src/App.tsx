
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";

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
import AdminAuth from "./pages/AdminAuth";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import MyBookings from "./pages/MyBookings";
import HairRecommendation from "./pages/HairRecommendation";
import PaymentSimulator from "./components/payment/PaymentSimulator";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Security from "./pages/Security";
import DeleteAccount from "./pages/DeleteAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/book-now" element={<BookNow />} />
              <Route path="/book/:id" element={<SalonDetails />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment/simulator" element={<PaymentSimulator />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/merchant-signup" element={<MerchantSignup />} />
              <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
              <Route path="/merchant-login" element={<MerchantAuth />} />
              <Route path="/merchant-pending" element={<MerchantPending />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-login" element={<AdminAuth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/hair-recommendation" element={<HairRecommendation />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/security" element={<Security />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
