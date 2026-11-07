import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { NavigationProgressBar } from "./components/NavigationProgressBar";
import { BookieLoader, useInitialLoad } from "./components/BookieLoader";
import { useProfile, ProfileProvider } from "./hooks/useProfile";
import { ErrorBoundary } from "./components/ErrorBoundary";
const Index = lazy(() => import("./pages/Index"));
const Materials = lazy(() => import("./pages/Materials"));
const Tests = lazy(() => import("./pages/Tests"));
const YPT = lazy(() => import("./pages/YPT"));
const Portals = lazy(() => import("./pages/Portals"));
const PortalDetail = lazy(() => import("./pages/PortalDetail"));
const TestSeriesDetail = lazy(() => import("./pages/TestSeriesDetail"));
const Support = lazy(() => import("./pages/Support"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminCommunity = lazy(() => import("./pages/admin/AdminCommunity"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminMaterials = lazy(() => import("./pages/admin/AdminMaterials"));
const AdminPortals = lazy(() => import("./pages/admin/AdminPortals"));
const AdminTests = lazy(() => import("./pages/admin/AdminTests"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const Community = lazy(() => import("./pages/Community"));
import NotFound from "./pages/NotFound";
const CopyrightTerms = lazy(() => import("./pages/CopyrightTerms"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DMCA = lazy(() => import("./pages/DMCA"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Donate = lazy(() => import("./pages/Donate"));
import Welcome from "./pages/Welcome";
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient();

const OPEN_PATHS = new Set([
  "/welcome",
  "/onboarding",
  "/auth",
  "/reset-password",
  "/privacy-policy",
  "/privacy",
  "/copyright-terms",
  "/terms",
  "/terms-of-service",
  "/dmca",
  "/donate",
  "/profile",
]);

function ProfileGate() {
  const { profile, loading, isOnboarded, isAuthenticated } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const path = location.pathname;
    if (OPEN_PATHS.has(path)) return;
    if (path.startsWith("/admin")) return;

    // For non-registered / un-onboarded users opening the site:
    // Route them to /welcome so they choose auth method (Google, Email, or Guest)
    if (!isOnboarded) {
      if (isAuthenticated) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/welcome", { replace: true });
      }
    }
  }, [loading, profile, isOnboarded, isAuthenticated, location.pathname, navigate]);

  return null;
}

function AppRoutes() {
  const location = useLocation();

  // Keep one self-referencing canonical per route. index.html is shared by the
  // whole SPA, so a static canonical there would point every page at the
  // homepage; setting it here makes each page canonicalise to itself, and the
  // duplicate legal routes fold into their primary URLs.
  useEffect(() => {
    const alias: Record<string, string> = {
      "/privacy-policy": "/privacy",
      "/terms-of-service": "/terms",
      // The signed-out welcome page is the public face of the homepage.
      "/welcome": "/",
    };
    const path = alias[location.pathname] ?? location.pathname;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `https://www.bookiejee.cv${path}`;
  }, [location.pathname]);

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <div className="flex-1 flex flex-col w-full">
        <Suspense fallback={<BookieLoader fullscreen={false} />}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/test-series/:id" element={<TestSeriesDetail />} />
          <Route path="/ypt" element={<YPT />} />
          <Route path="/portals" element={<Portals />} />
          <Route path="/portals/:id" element={<PortalDetail />} />
          <Route path="/support" element={<Support />} />
          <Route path="/community" element={<Community />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/materials" element={<AdminMaterials />} />
          <Route path="/admin/portals" element={<AdminPortals />} />
          <Route path="/admin/tests" element={<AdminTests />} />
          <Route path="/admin/community" element={<AdminCommunity />} />
          <Route path="/copyright-terms" element={<CopyrightTerms />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

const AppInner = () => {
  const loading = useInitialLoad(1100);
  if (loading) return <BookieLoader label="Welcome back" />;
  return (
    <BrowserRouter>
      <NavigationProgressBar />
      <ScrollToTop />
      <ProfileGate />
      <AppRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProfileProvider>
          <AppInner />
        </ProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
