
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IdeaCard } from "@/components/vote/IdeaCard";
import { SearchControls } from "@/components/vote/SearchControls";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Idea } from "@/types/idea";
import { getIdeas, updateIdea } from "@/integrations/mariadb/client";

export default function Vote() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [votedIdeas, setVotedIdeas] = useState<string[]>(() => {
    const savedVotes = localStorage.getItem("votedIdeas");
    return savedVotes ? JSON.parse(savedVotes) : [];
  });
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Store voted ideas in localStorage
  useEffect(() => {
    localStorage.setItem("votedIdeas", JSON.stringify(votedIdeas));
  }, [votedIdeas]);

  // Query to fetch ideas
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: async () => {
      try {
        const data = await getIdeas();
        
        console.log("Fetched ideas:", data);
        
        // Map the data to match the Idea type with summary property
        return Array.isArray(data) ? data.map((idea: any): Idea => ({
          id: idea.id,
          title: idea.title,
          category: idea.category,
          description: idea.description,
          summary: idea.summary || "",
          votes: idea.votes || 0,
          created_at: idea.created_at,
          frozen: idea.frozen
        })) : [];
      } catch (error) {
        console.error("Error fetching ideas:", error);
        throw error;
      }
    },
  });

  // Mutation to update idea votes
  const voteMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      // If user is not logged in, don't allow voting
      if (!user) {
        throw new Error("You must be logged in to vote");
      }

      // If already voted for this idea, don't allow voting again
      if (votedIdeas.includes(ideaId)) {
        throw new Error("You've already voted for this idea");
      }

      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) {
        throw new Error("Idea not found");
      }

      const result = await updateIdea(ideaId, { votes: idea.votes + 1 });
      return ideaId;
    },
    onSuccess: (ideaId) => {
      // Add to voted ideas list
      setVotedIdeas((prev) => [...prev, ideaId]);
      
      // Invalidate the ideas query to refetch
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      
      toast.success("Your vote has been counted!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to vote");
    },
  });

  // Filter ideas based on search query and category
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) || 
                         idea.description.toLowerCase().includes(search.toLowerCase()) ||
                         (idea.summary && idea.summary.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || idea.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleVote = (ideaId: string) => {
    voteMutation.mutate(ideaId);
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
      <div className="max-w-4xl mx-auto pt-16">
        <h1 className="text-4xl font-bold text-white text-center mb-2">Vote on Ideas</h1>
        <p className="text-gray-400 text-center mb-8">
          Support the ideas you believe in by casting your vote
        </p>

        <SearchControls 
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="grid gap-6 mt-8">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              hasVoted={votedIdeas.includes(idea.id)}
              onVote={handleVote}
              showVoteButton={true}
            />
          ))}
          
          {filteredIdeas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No ideas found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
