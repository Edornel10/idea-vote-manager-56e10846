
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Idea } from '@/types/ideas';

interface IdeasContextType {
  ideas: Idea[];
  updateIdea: (ideaId: string, updates: Partial<Idea>) => Promise<void>;
  isLoading: boolean;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export function IdeasProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ideas:', error);
        return;
      }

      setIdeas(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIdea = async (ideaId: string, updates: Partial<Idea>) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', ideaId);

      if (error) {
        console.error('Error updating idea:', error);
        return;
      }

      setIdeas(currentIdeas =>
        currentIdeas.map(idea =>
          idea.id === ideaId
            ? { ...idea, ...updates }
            : idea
        )
      );
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  return (
    <IdeasContext.Provider value={{ ideas, updateIdea, isLoading }}>
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
