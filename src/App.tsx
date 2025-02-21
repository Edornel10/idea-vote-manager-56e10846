
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
import Vote from "./pages/Vote";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { IdeasProvider } from "@/contexts/IdeasContext";

function App() {
  return (
    <IdeasProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<Create />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </IdeasProvider>
  );
}

export default App;
