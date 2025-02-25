
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Create from "./pages/Create";
import Vote from "./pages/Vote";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center">
            <Link
              to="/browse"
              className={`nav-link ${location.pathname === "/browse" ? "active" : ""}`}
            >
              Browse
            </Link>
            <Link
              to="/create"
              className={`nav-link ${location.pathname === "/create" ? "active" : ""}`}
            >
              Create
            </Link>
            <Link
              to="/vote"
              className={`nav-link ${location.pathname === "/vote" ? "active" : ""}`}
            >
              Vote
            </Link>
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
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
