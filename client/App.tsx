import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { DonationProvider } from "@/context/DonationContext";
import { NGOProvider } from "@/context/NGOContext";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import RoleSelection from "./pages/RoleSelection";
import Auth from "./pages/Auth";
import NGOSelection from "./pages/NGOSelection";
import NGOBrowse from "./pages/NGOBrowse";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";
import AppAdminDashboard from "./pages/AppAdminDashboard";
import MapsTracking from "./pages/MapsTracking";
import NGOOnboarding from "./pages/NGOOnboarding";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

function CompleteProfileRoute() {
  const { userData, user } = useAuth();
  if (userData?.email === 'ngo@careandhope.org' || user?.email === 'ngo@careandhope.org') {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <NGOOnboarding />
    </div>
  );
}

/*
  Automatically routes users based on role
*/
function DashboardRouter() {
  const { role } = useAuth();

  if (role === "donor") {
    return <NGOBrowse />;
  }

  if (role === "ngo_admin") {
    return <NGODashboard />;
  }

  if (role === "app_admin") {
    return <AppAdminDashboard />;
  }

  return <NotFound />;
}

/*
  Application Routes
*/
function AppRoutes() {
  return (
    <Routes>
      {/* Direct Login & Account Creation Portal */}
      <Route path="/" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/roles" element={<RoleSelection />} />
      <Route path="/ngo-selection" element={<NGOSelection />} />

      {/* Complete Profile Onboarding Route */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute allowedRoles={["ngo_admin"]}>
            <CompleteProfileRoute />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Donor Specific Routes */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={["donor"]}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <ProtectedRoute allowedRoles={["donor"]}>
            <NGOBrowse />
          </ProtectedRoute>
        }
      />

      {/* Maps Route */}
      <Route path="/maps" element={<MapsTracking />} />
      <Route path="/map" element={<MapsTracking />} />

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/*
  Main App
*/
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LocationProvider>
          <AuthProvider>
            <NGOProvider>
              <DonationProvider>
                <Toaster />
                <Sonner />

                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </DonationProvider>
            </NGOProvider>
          </AuthProvider>
        </LocationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

/*
  Render App
*/
const root = createRoot(document.getElementById("root")!);
root.render(<App />);