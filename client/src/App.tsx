
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Browse from "./pages/Browse";
import Create from "./pages/Create";
import Vote from "./pages/Vote";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { cn } from "./lib/utils";
import { NavigationLink } from "./components/NavigationLink";
import { MobileNav } from "./components/MobileNav";

const queryClient = new QueryClient();

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { path: "/browse", label: "Browse", requireAuth: true },
    { path: "/create", label: "Create", requireAuth: true },
    { path: "/vote", label: "Vote", requireAuth: true },
    { path: "/users", label: "Users", requireAuth: true, requireAdmin: true },
    { path: "/auth", label: "Sign In", requireAuth: false, hideWhenAuth: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-white md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigationLinks.map((link) => {
              if (link.requireAuth && !user) return null;
              if (link.requireAdmin && user?.role !== "admin") return null;
              if (link.hideWhenAuth && user) return null;

              return (
                <NavigationLink
                  key={link.path}
                  to={link.path}
                  label={link.label}
                />
              );
            })}
            {user && (
              <button
                onClick={logout}
                className={cn(
                  "text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium",
                  "transition-colors duration-200"
                )}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navigationLinks}
        user={user}
        onLogout={logout}
      />
    </nav>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <div className="pt-16"> {/* Add padding for fixed navbar */}
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/browse" replace />} />
            <Route
              path="/browse"
              element={
                <ProtectedRoute>
                  <Browse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <Create />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote"
              element={
                <ProtectedRoute>
                  <Vote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
