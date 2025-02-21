
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useIdeas } from "@/contexts/IdeasContext";

const categories = ["All", "Education", "Environment", "Community", "Technology", "Health"];

export default function Index() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { ideas } = useIdeas();

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
                         idea.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            Explore Ideas
          </motion.h1>
          <p className="text-gray-600">Discover and filter through innovative ideas</p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
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
              <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
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
            className="flex items-center justify-center w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <span className="text-2xl">+</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
