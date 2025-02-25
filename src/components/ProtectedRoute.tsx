
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'standard';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#222222] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // useAuth will redirect to /auth
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#222222] flex items-center justify-center">
        <p className="text-white">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
