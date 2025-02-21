
import React, { createContext, useContext, useState } from 'react';

interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  votes: number;
}

const initialIdeas: Idea[] = [
  {
    id: "1",
    title: "AI-Powered Learning Platform",
    category: "Education",
    description: "Create an adaptive learning platform that uses AI to personalize content.",
    votes: 15,
  },
  {
    id: "2",
    title: "Sustainable Food Delivery",
    category: "Environment",
    description: "Zero-waste food delivery service using reusable containers.",
    votes: 10,
  },
  {
    id: "3",
    title: "Community Skills Exchange",
    category: "Community",
    description: "Platform for neighbors to exchange skills and services.",
    votes: 8,
  },
];

interface IdeasContextType {
  ideas: Idea[];
  updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export function IdeasProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);

  const updateIdea = (ideaId: string, updates: Partial<Idea>) => {
    setIdeas(currentIdeas =>
      currentIdeas.map(idea =>
        idea.id === ideaId
          ? { ...idea, ...updates }
          : idea
      )
    );
  };

  return (
    <IdeasContext.Provider value={{ ideas, updateIdea }}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const context = useContext(IdeasContext);
  if (context === undefined) {
    throw new Error('useIdeas must be used within an IdeasProvider');
  }
  return context;
}
