
import { Idea } from '@/types/idea';
import { User } from '@/hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Ideas related API calls
export const getIdeas = async (includeAll = false): Promise<Idea[]> => {
  try {
    const response = await fetch(`${API_URL}/ideas?includeAll=${includeAll}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch ideas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return [];
  }
};

export const getIdeaById = async (id: string): Promise<Idea | null> => {
  try {
    const response = await fetch(`${API_URL}/ideas/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch idea');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching idea:', error);
    return null;
  }
};

export const createIdea = async (idea: {
  title: string;
  category: string;
  description: string;
  summary?: string;
}): Promise<Idea | null> => {
  try {
    const response = await fetch(`${API_URL}/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idea),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create idea');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating idea:', error);
    throw error;
  }
};

export const updateIdea = async (
  id: string,
  updates: { votes?: number; frozen?: boolean }
): Promise<Idea | null> => {
  try {
    const response = await fetch(`${API_URL}/ideas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update idea');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating idea:', error);
    return null;
  }
};

export const deleteIdea = async (id: string): Promise<{ id: string }> => {
  try {
    const response = await fetch(`${API_URL}/ideas/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete idea');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting idea:', error);
    throw error;
  }
};

// User related API calls
export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const getUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/users`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (user: {
  username: string;
  password: string;
  role?: 'admin' | 'standard';
}): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<{ id: string }> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
