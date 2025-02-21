
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIdeas } from "@/contexts/IdeasContext";

const VOTING_PASSWORD = "ideas123";

export default function Vote() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [votedIdeas, setVotedIdeas] = useState<string[]>([]);
  const { ideas, updateIdea, isLoading } = useIdeas();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState<string | null>(null);

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

    setIsVoting(ideaId);
    try {
      const idea = ideas.find(i => i.id === ideaId);
      if (idea) {
        await updateIdea(ideaId, { votes: idea.votes + 1 });
        setVotedIdeas([...votedIdeas, ideaId]);
        toast({
          title: "Success!",
          description: "Your vote has been recorded",
        });
      }
    } finally {
      setIsVoting(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Enter Voting Password</h2>
            <div className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <Button
                className="w-full"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vote for Ideas</h1>
          <p className="text-gray-600">Support the ideas you believe in</p>
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
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{idea.title}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {idea.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{idea.votes}</span>
                    <p className="text-sm text-gray-500">votes</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{idea.description}</p>
                <Button
                  className="w-full"
                  disabled={votedIdeas.includes(idea.id) || isVoting === idea.id}
                  onClick={() => handleVote(idea.id)}
                >
                  {isVoting === idea.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4 mr-2" />
                  )}
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
