
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  votes: number;
}

const VOTING_PASSWORD = "ideas123"; // In a real app, this would be stored securely

export default function Vote() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [votedIdeas, setVotedIdeas] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleAuthenticate = () => {
    if (password === VOTING_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Success!",
        description: "You can now vote for ideas.",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

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
      
      setVotedIdeas(prev => [...prev, ideaId]);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#222222] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-[#333333] p-6 border-0">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">Enter Voting Password</h2>
            <div className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
              />
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleAuthenticate}
              >
                Access Voting
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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

        <motion.div 
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {ideas.map((idea) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-[#333333] p-6 border-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{idea.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {idea.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">{idea.votes}</span>
                    <p className="text-sm text-gray-400">votes</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{idea.description}</p>
                <Button
                  className={`w-full ${votedIdeas.includes(idea.id) ? 'bg-gray-600' : 'bg-primary hover:bg-primary/90'}`}
                  disabled={votedIdeas.includes(idea.id)}
                  onClick={() => handleVote(idea.id)}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {votedIdeas.includes(idea.id) ? "Already Voted" : "Vote"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
