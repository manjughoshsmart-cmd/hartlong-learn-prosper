import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

// Eager-load homepage for fast LCP
import Index from "./pages/Index";

// Code-split all other routes to shrink initial JS bundle
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Downloads = lazy(() => import("./pages/Downloads"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminResources = lazy(() => import("./pages/AdminResources"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const Equity = lazy(() => import("./pages/Equity"));
const Option = lazy(() => import("./pages/Option"));
const MutualFund = lazy(() => import("./pages/MutualFund"));
const ETF = lazy(() => import("./pages/ETF"));
const Resources = lazy(() => import("./pages/Resources"));
const ResourceDetail = lazy(() => import("./pages/ResourceDetail"));
const Tools = lazy(() => import("./pages/Tools"));
const SIPCalculator = lazy(() => import("./pages/tools/SIPCalculator"));
const CompoundCalculator = lazy(() => import("./pages/tools/CompoundCalculator"));
const ProfitLossCalculator = lazy(() => import("./pages/tools/ProfitLossCalculator"));
const BrokerageCalculator = lazy(() => import("./pages/tools/BrokerageCalculator"));
const PositionSizeCalculator = lazy(() => import("./pages/tools/PositionSizeCalculator"));
const RiskRewardCalculator = lazy(() => import("./pages/tools/RiskRewardCalculator"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const SitemapPage = lazy(() => import("./pages/Sitemap"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Loading" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Index />} />
                <Route path="/equity" element={<Equity />} />
                <Route path="/option" element={<Option />} />
                <Route path="/mutual-fund" element={<MutualFund />} />
                <Route path="/etf" element={<ETF />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/sip" element={<SIPCalculator />} />
                <Route path="/tools/compound" element={<CompoundCalculator />} />
                <Route path="/tools/profit-loss" element={<ProfitLossCalculator />} />
                <Route path="/tools/brokerage" element={<BrokerageCalculator />} />
                <Route path="/tools/position-size" element={<PositionSizeCalculator />} />
                <Route path="/tools/risk-reward" element={<RiskRewardCalculator />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/sitemap" element={<SitemapPage />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* User Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/dashboard/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
                <Route path="/dashboard/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />

                {/* Admin Protected */}
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
