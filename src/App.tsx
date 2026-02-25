import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Bookmarks from "./pages/Bookmarks";
import Downloads from "./pages/Downloads";
import AdminDashboard from "./pages/AdminDashboard";
import AdminResources from "./pages/AdminResources";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import Equity from "./pages/Equity";
import Option from "./pages/Option";
import MutualFund from "./pages/MutualFund";
import ETF from "./pages/ETF";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Tools from "./pages/Tools";
import SIPCalculator from "./pages/tools/SIPCalculator";
import CompoundCalculator from "./pages/tools/CompoundCalculator";
import ProfitLossCalculator from "./pages/tools/ProfitLossCalculator";
import BrokerageCalculator from "./pages/tools/BrokerageCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              

              {/* User Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
