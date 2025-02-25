
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Browse from "./pages/Browse";
import Create from "./pages/Create";
import Vote from "./pages/Vote";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center">
            {user ? (
              <>
                <Link
                  to="/browse"
                  className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === "/browse" ? "bg-[#ea384c]/10" : ""
                  }`}
                >
                  Browse
                </Link>
                <Link
                  to="/create"
                  className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === "/create" ? "bg-[#ea384c]/10" : ""
                  }`}
                >
                  Create
                </Link>
                <Link
                  to="/vote"
                  className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === "/vote" ? "bg-[#ea384c]/10" : ""
                  }`}
                >
                  Vote
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/users"
                    className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === "/users" ? "bg-[#ea384c]/10" : ""
                    }`}
                  >
                    Users
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/auth"
                className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/auth" ? "bg-[#ea384c]/10" : ""
                }`}
              >
                Sign In
              </Link>
            )}
          </div>
          <div className="flex items-center">
            {user && (
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            )}
          </div>
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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Browse />
              </ProtectedRoute>
            }
          />
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
