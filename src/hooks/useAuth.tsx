
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  role: 'admin' | 'standard';
}

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    if (!isLoading && requireAuth && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, requireAuth, navigate]);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Force a full page refresh and redirect to auth page
    window.location.href = '/auth';
  };

  return { user, isLoading, login, logout };
}
