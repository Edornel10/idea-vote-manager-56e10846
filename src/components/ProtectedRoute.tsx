
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      toast.error("Please login to access this page");
      navigate("/");
    }
  }, [navigate]);

  return <>{children}</>;
}
