
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/types/idea";

interface SearchControlsProps {
  search: string;
  selectedCategory: string;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export function SearchControls({
  search,
  selectedCategory,
  onSearchChange,
  onCategoryChange
}: SearchControlsProps) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full bg-[#444444] border-0 text-white placeholder:text-gray-400"
        />
      </div>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
  );
}
