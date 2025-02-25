
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface User {
  id: string;
  role: 'admin' | 'standard';
}

export type NavigationCommand = 'browse' | 'create' | 'vote' | 'users' | 'auth';

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
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
        navigate('/auth', { state: { from: location.pathname }, replace: true });
      } else if (user && location.pathname === '/auth') {
        const from = location.state?.from || '/browse';
        navigate(from, { replace: true });
      }
    }
  }, [user, isLoading, requireAuth, navigate, location]);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    const from = location.state?.from || '/browse';
    navigate(from, { replace: true });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth', { replace: true });
  };

  const navigateTo = (command: NavigationCommand) => {
    if (!user && command !== 'auth') {
      navigate('/auth', { state: { from: `/${command}` }, replace: true });
      return;
    }

    if (user && command === 'auth') {
      navigate('/browse', { replace: true });
      return;
    }

    navigate(`/${command}`, { replace: true });
  };

  return { user, isLoading, login, logout, navigateTo };
}
