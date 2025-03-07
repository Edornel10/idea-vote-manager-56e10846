import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifyPassword } from '@/integrations/mariadb/client';

export type User = {
  id: string;
  role: 'admin' | 'standard';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentials: User | {username: string, password: string}) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: User | {username: string, password: string}): Promise<boolean> => {
    try {
      // If we already have a user object (from supabase response)
      if ('id' in credentials && 'role' in credentials) {
        setUser(credentials);
        localStorage.setItem('user', JSON.stringify(credentials));
        return true;
      }
      
      // Otherwise, verify username/password
      if ('username' in credentials && 'password' in credentials) {
        const result = await verifyPassword(credentials.username, credentials.password);
        
        if (result) {
          setUser(result);
          localStorage.setItem('user', JSON.stringify(result));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
