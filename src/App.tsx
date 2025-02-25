
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Browse from "./pages/Browse";
import Create from "./pages/Create";
import Vote from "./pages/Vote";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";

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
            <Link
              to="/users"
              className={`text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/users" ? "bg-[#ea384c]/10" : ""
              }`}
            >
              Users
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
            <Route path="/" element={<Browse />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/create" element={<Create />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
