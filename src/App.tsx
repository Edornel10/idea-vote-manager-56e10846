
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import Browse from "./pages/Browse";
import Create from "./pages/Create";
import Vote from "./pages/Vote";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { cn } from "./lib/utils";

const queryClient = new QueryClient();

const Navigation = () => {
  const { user, logout } = useAuth(true);
  const navigate = useNavigate();

  const navItems = [
    { path: "/browse", label: "Browse", requiredAuth: true },
    { path: "/create", label: "Create", requiredAuth: true },
    { path: "/vote", label: "Vote", requiredAuth: true },
    { path: "/users", label: "Users", requiredAuth: true, adminOnly: true },
    { path: "/auth", label: "Sign In", requiredAuth: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex space-x-8 items-center">
            {navItems.map((item) => {
              if (!user && item.requiredAuth) return null;
              if (item.adminOnly && user?.role !== 'admin') return null;
              if (user && item.path === '/auth') return null;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium",
                    "transition-colors duration-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Logout
            </button>
          )}
        </div>
      </div>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

