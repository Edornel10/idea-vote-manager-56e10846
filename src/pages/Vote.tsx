
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchControls } from "@/components/vote/SearchControls";
import { IdeaCard } from "@/components/vote/IdeaCard";
import type { Idea } from "@/types/idea";

export default function Vote() {
  const [votedIdeas, setVotedIdeas] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load voted ideas from sessionStorage on component mount
  useEffect(() => {
    const storedVotes = sessionStorage.getItem('votedIdeas');
    if (storedVotes) {
      setVotedIdeas(JSON.parse(storedVotes));
    }
  }, []);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('votes', { ascending: false });
      
      if (error) throw error;
      return data as Idea[];
    }
  });

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
                         idea.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVote = async (ideaId: string) => {
    if (votedIdeas.includes(ideaId)) {
      toast({
        title: "Error",
        description: "You've already voted for this idea",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('ideas')
        .update({ votes: (ideas.find(i => i.id === ideaId)?.votes || 0) + 1 })
        .eq('id', ideaId);

      if (error) throw error;
      
      // Update votedIdeas in state and sessionStorage
      const newVotedIdeas = [...votedIdeas, ideaId];
      setVotedIdeas(newVotedIdeas);
      sessionStorage.setItem('votedIdeas', JSON.stringify(newVotedIdeas));
      
      await queryClient.invalidateQueries({ queryKey: ['ideas'] });
      
      toast({
        title: "Success!",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#222222] flex items-center justify-center">
        <p className="text-white">Loading ideas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Vote for Ideas</h1>
          <p className="text-gray-400">Support the ideas you believe in</p>
        </motion.div>

        <SearchControls
          search={search}
          selectedCategory={selectedCategory}
          onSearchChange={setSearch}
          onCategoryChange={setSelectedCategory}
        />

        <motion.div 
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              hasVoted={votedIdeas.includes(idea.id)}
              onVote={handleVote}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
