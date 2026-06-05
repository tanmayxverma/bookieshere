import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { BookieLoader, useInitialLoad } from "./components/BookieLoader";
import { useProfile } from "./hooks/useProfile";
import Index from "./pages/Index";
import Materials from "./pages/Materials";
import Tests from "./pages/Tests";
import YPT from "./pages/YPT";
import Portals from "./pages/Portals";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import CopyrightTerms from "./pages/CopyrightTerms";
import DMCA from "./pages/DMCA";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Donate from "./pages/Donate";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const OPEN_PATHS = new Set(["/welcome", "/onboarding", "/reset-password", "/privacy-policy", "/copyright-terms", "/dmca"]);

function ProfileGate() {
  const { profile, loading, isOnboarded } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const path = location.pathname;
    if (OPEN_PATHS.has(path)) return;
    if (!profile) {
      navigate("/welcome", { replace: true });
    } else if (!isOnboarded) {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, profile, isOnboarded, location.pathname, navigate]);

  return null;
}

const AppInner = () => {
  const loading = useInitialLoad(1100);
  if (loading) return <BookieLoader label="Welcome back" />;
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ProfileGate />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/ypt" element={<YPT />} />
        <Route path="/portals" element={<Portals />} />
        <Route path="/support" element={<Support />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/copyright-terms" element={<CopyrightTerms />} />
        <Route path="/dmca" element={<DMCA />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
