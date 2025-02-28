
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Plus, Trash2, SnowflakeIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { categories } from "@/types/idea";
import { useAuth } from "@/hooks/useAuth";
import { IdeaCard } from "@/components/vote/IdeaCard";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('votes', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (ideaId: string) => {
    if (user?.role !== 'admin') {
      toast.error("Only administrators can delete ideas");
      return;
    }

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success("Idea deleted successfully");
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error("Failed to delete idea");
    }
  };

  // New mutation for toggling the frozen status
  const toggleFreezeMutation = useMutation({
    mutationFn: async ({ ideaId, frozen }: { ideaId: string; frozen: boolean }) => {
      const { error } = await supabase
        .from('ideas')
        .update({ frozen })
        .eq('id', ideaId);
      
      if (error) throw error;
      return { ideaId, frozen };
    },
    onSuccess: ({ frozen }) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success(`Idea ${frozen ? 'frozen' : 'unfrozen'} successfully`);
    },
    onError: () => {
      toast.error("Failed to update idea status");
    }
  });

  const handleToggleFreeze = (ideaId: string, currentStatus: boolean) => {
    if (user?.role !== 'admin') {
      toast.error("Only administrators can freeze/unfreeze ideas");
      return;
    }

    toggleFreezeMutation.mutate({ ideaId, frozen: !currentStatus });
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
                         idea.description.toLowerCase().includes(search.toLowerCase()) ||
                         (idea.summary && idea.summary.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Explore Ideas</h1>
          <p className="text-gray-400">Discover and filter through innovative ideas</p>
        </motion.div>

        <div className="flex gap-4 my-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full bg-[#444444] border-0 text-white placeholder:text-gray-400"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-[#444444] border-0 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <motion.div 
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredIdeas.map((idea) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <IdeaCard 
                idea={{
                  id: idea.id,
                  title: idea.title,
                  category: idea.category,
                  description: idea.description,
                  summary: idea.summary || "",
                  votes: idea.votes || 0,
                  created_at: idea.created_at,
                  frozen: idea.frozen
                }}
                showVoteButton={false}
              />
              {user?.role === 'admin' && (
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFreeze(idea.id, !!idea.frozen)}
                    className={`text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 ${idea.frozen ? 'bg-blue-400/20 text-blue-400' : ''}`}
                    title={idea.frozen ? "Unfreeze idea" : "Freeze idea"}
                  >
                    <SnowflakeIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(idea.id)}
                    className="text-gray-400 hover:text-[#ea384c] hover:bg-[#ea384c]/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="fixed bottom-8 right-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/create"
            className="flex items-center justify-center w-14 h-14 bg-[#ea384c] text-white rounded-full shadow-lg hover:bg-[#ea384c]/90 transition-colors duration-200"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
