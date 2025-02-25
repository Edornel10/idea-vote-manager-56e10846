
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Plus, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Idea {
  id: string;
  title: string;
  category: string;
  description: string;
  votes: number;
}

const categories = ["All", "Education", "Environment", "Community", "Technology", "Health"];

export default function Browse() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully logged out!");
      navigate("/");
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
                         idea.description.toLowerCase().includes(search.toLowerCase());
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Explore Ideas
            </h1>
            <p className="text-gray-400">
              Discover and filter through innovative ideas
            </p>
          </motion.div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="flex gap-4 mb-8">
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
            >
              <Card className="bg-[#333333] p-6 border-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {idea.title}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ea384c]/20 text-[#ea384c]">
                      {idea.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">
                      {idea.votes}
                    </span>
                    <p className="text-sm text-gray-400">votes</p>
                  </div>
                </div>
                <p className="text-gray-300">{idea.description}</p>
              </Card>
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
