
import { User } from '@/hooks/useAuth';

// Mock database for browser environment
const mockIdeas = [
  {
    id: '1',
    title: 'Add Dark Mode',
    category: 'UI/UX',
    description: 'Implement a dark mode option for better night-time viewing',
    summary: 'Better for night-time viewing',
    votes: 15,
    frozen: false
  },
  {
    id: '2',
    title: 'Mobile App',
    category: 'Features',
    description: 'Create a mobile app version for iOS and Android',
    summary: 'For iOS and Android',
    votes: 20,
    frozen: false
  },
  {
    id: '3',
    title: 'User Profiles',
    category: 'Features',
    description: 'Add user profiles with activity history and badges',
    summary: 'With activity history and badges',
    votes: 8,
    frozen: true
  }
];

const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password_hash: '$2a$10$JwYX5DrFUDTg7zN1CQUQWOQWtTJ0GY5NUow.xvXMqCQALpFH.j8c.', // Password: admin123
    role: 'admin'
  },
  {
    id: '2',
    username: 'user',
    password_hash: '$2a$10$i3.Z8fVVL6nMriZQC5l0KO/SVUQBF.T4jrBxKznOj6GxV6W0QzXFu', // Password: user123
    role: 'standard'
  }
];

// Initialize database connection
export const initDatabase = async () => {
  console.log('Mock database initialized');
  return null;
};

// Get database connection
export const getDb = async () => {
  return null;
};

// Ideas related functions
export const getIdeas = async (includeAll = false) => {
  console.log('Getting ideas, includeAll:', includeAll);
  if (!includeAll) {
    return mockIdeas.filter(idea => !idea.frozen);
  }
  return mockIdeas;
};

export const getIdeaById = async (id: string) => {
  console.log('Getting idea by id:', id);
  return mockIdeas.find(idea => idea.id === id) || null;
};

export const createIdea = async (idea: {
  title: string;
  category: string;
  description: string;
  summary?: string;
  votes?: number;
}) => {
  console.log('Creating idea:', idea);
  const id = Math.random().toString(36).substring(2, 15);
  const newIdea = { id, ...idea, votes: idea.votes || 0, frozen: false };
  mockIdeas.push(newIdea);
  return newIdea;
};

export const updateIdea = async (
  id: string,
  updates: { votes?: number; frozen?: boolean }
) => {
  console.log('Updating idea:', id, updates);
  const ideaIndex = mockIdeas.findIndex(idea => idea.id === id);
  if (ideaIndex === -1) return null;
  
  const updatedIdea = { ...mockIdeas[ideaIndex] };
  
  if (updates.votes !== undefined) {
    updatedIdea.votes = updates.votes;
  }
  
  if (updates.frozen !== undefined) {
    updatedIdea.frozen = updates.frozen;
  }
  
  mockIdeas[ideaIndex] = updatedIdea;
  return updatedIdea;
};

export const deleteIdea = async (id: string) => {
  console.log('Deleting idea:', id);
  const ideaIndex = mockIdeas.findIndex(idea => idea.id === id);
  if (ideaIndex !== -1) {
    mockIdeas.splice(ideaIndex, 1);
  }
  return { id };
};

// User related functions
export const getUserByUsername = async (username: string) => {
  console.log('Getting user by username:', username);
  return mockUsers.find(user => user.username === username) || null;
};

import bcrypt from 'bcryptjs';

export const verifyPassword = async (username: string, password: string) => {
  console.log('Verifying password for:', username);
  const user = await getUserByUsername(username);
  if (!user) return null;
  
  // In browser environment, authenticate based on hardcoded values for demo
  if (username === 'admin' && password === 'admin123') {
    return { id: '1', role: 'admin' as const };
  } else if (username === 'user' && password === 'user123') {
    return { id: '2', role: 'standard' as const };
  }
  
  return null;
};

export const createUser = async (user: {
  username: string;
  password: string;
  role?: 'admin' | 'standard';
}) => {
  console.log('Creating user:', user);
  const id = Math.random().toString(36).substring(2, 15);
  const hashedPassword = 'hashed-password'; // Mock password hash
  
  const newUser = { 
    id, 
    username: user.username, 
    password_hash: hashedPassword,
    role: user.role || 'standard'
  };
  
  mockUsers.push(newUser);
  return { id, username: user.username, role: user.role || 'standard' };
};

export const getUsers = async () => {
  console.log('Getting all users');
  return mockUsers.map(({ id, username, role }) => ({ id, username, role }));
};

export const deleteUser = async (id: string) => {
  console.log('Deleting user:', id);
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    mockUsers.splice(userIndex, 1);
  }
  return { id };
};
