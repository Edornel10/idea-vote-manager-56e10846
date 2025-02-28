
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Idea } from "@/types/idea";

interface IdeaCardProps {
  idea: Idea;
  hasVoted?: boolean;
  onVote?: (ideaId: string) => void;
  showVoteButton?: boolean;
}

export function IdeaCard({ idea, hasVoted = false, onVote, showVoteButton = true }: IdeaCardProps) {
  const [showDescription, setShowDescription] = useState(false);

  const toggleDescription = () => {
    setShowDescription(prev => !prev);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-[#333333] p-6 border-0 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow pr-16"> {/* Add padding-right to prevent overlap with votes */}
            <h3 className="text-xl font-semibold text-white mb-1">{idea.title}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ea384c]/20 text-[#ea384c]">
              {idea.category}
            </span>
          </div>
          <div className="text-right absolute top-6 right-6"> {/* Position votes absolutely */}
            <span className="text-2xl font-bold text-white">{idea.votes}</span>
            <p className="text-sm text-gray-400">votes</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-gray-300">
            {idea.summary || idea.description.substring(0, 150) + (idea.description.length > 150 ? '...' : '')}
          </p>
          {idea.description.length > 150 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-gray-400 hover:text-white p-0 h-auto"
              onClick={toggleDescription}
            >
              {showDescription ? (
                <><ChevronUp className="w-4 h-4 mr-1" /> Show less</>
              ) : (
                <><ChevronDown className="w-4 h-4 mr-1" /> Show more</>
              )}
            </Button>
          )}
          {showDescription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-gray-300 bg-[#2a2a2a] p-3 rounded-md"
            >
              {idea.description}
            </motion.div>
          )}
        </div>
        {showVoteButton && (
          <Button
            className={`w-full ${hasVoted ? 'bg-gray-600' : 'bg-[#ea384c] hover:bg-[#ea384c]/90'}`}
            disabled={hasVoted}
            onClick={() => onVote && onVote(idea.id)}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {hasVoted ? "Already Voted" : "Vote"}
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
