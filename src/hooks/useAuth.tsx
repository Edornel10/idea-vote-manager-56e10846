
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  role: 'admin' | 'standard';
}

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state immediately from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !user) {
      navigate('/auth');
    }
  }, [user, requireAuth, navigate]);

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
