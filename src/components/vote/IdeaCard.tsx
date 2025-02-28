
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import type { Idea } from "@/types/idea";

interface IdeaCardProps {
  idea: Idea;
  hasVoted: boolean;
  onVote: (ideaId: string) => void;
}

export function IdeaCard({ idea, hasVoted, onVote }: IdeaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-[#333333] p-6 border-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">{idea.title}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ea384c]/20 text-[#ea384c]">
              {idea.category}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{idea.votes}</span>
            <p className="text-sm text-gray-400">votes</p>
          </div>
        </div>
        <p className="text-gray-300 mb-4">
          {idea.summary || idea.description.substring(0, 150) + (idea.description.length > 150 ? '...' : '')}
        </p>
        <Button
          className={`w-full ${hasVoted ? 'bg-gray-600' : 'bg-[#ea384c] hover:bg-[#ea384c]/90'}`}
          disabled={hasVoted}
          onClick={() => onVote(idea.id)}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          {hasVoted ? "Already Voted" : "Vote"}
        </Button>
      </Card>
    </motion.div>
  );
}
