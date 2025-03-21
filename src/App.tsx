
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Index from "./pages/Index";
import BookNow from "./pages/BookNow";
import MerchantSignup from "./pages/MerchantSignup";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Create a stub profile page until we implement it fully
const ProfilePage = () => (
  <div className="container mx-auto py-12">
    <h1 className="text-3xl font-bold">Profile</h1>
    <p className="mt-4">Your profile information will be displayed here.</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/book-now" element={<BookNow />} />
              <Route path="/merchant-signup" element={<MerchantSignup />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
