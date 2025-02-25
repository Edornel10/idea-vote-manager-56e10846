
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  role: 'admin' | 'standard';
}

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        // Save the attempted URL to redirect back after login
        navigate('/auth', { state: { from: location.pathname } });
      } else if (user && location.pathname === '/auth') {
        // If user is logged in and tries to access auth page, redirect to browse
        navigate('/browse');
      }
    }
  }, [user, isLoading, requireAuth, navigate, location]);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate('/browse');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  };

  return { user, isLoading, login, logout };
}
