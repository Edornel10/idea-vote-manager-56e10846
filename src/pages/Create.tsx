
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Download, Upload } from "lucide-react";
import { categories } from "@/types/idea";

// Remove "All" from categories since it's not a valid category for ideas
const validCategories = categories.filter(cat => cat !== "All");

export default function Create() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !summary) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ideas')
        .insert([
          { title, category, summary, description, votes: 0 }
        ]);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['ideas'] });
      
      toast({
        title: "Success!",
        description: "Your idea has been submitted",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: "Error",
        description: "Failed to submit your idea",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        
        // Skip header row and filter out empty rows
        const dataRows = rows.slice(1).filter(row => row.trim() !== '');
        
        if (dataRows.length === 0) {
          throw new Error("No data found in CSV file");
        }
        
        console.log("CSV Data Rows:", dataRows);
        
        // Parse CSV rows into ideas objects
        const ideas = [];
        for (const row of dataRows) {
          // CSV parsing logic that properly handles quoted values
          const columns = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
              if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
                // Handle escaped quotes (two double quotes in a quoted field)
                currentValue += '"';
                i++; // Skip the next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              // End of field
              columns.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last column
          columns.push(currentValue.trim());
          
          console.log("Parsed columns:", columns);
          
          // The export format includes id (0), title (1), category (2), summary (3), description (4), votes (5), created_at (6)
          // For import, we only need title, category, summary, description
          if (columns.length >= 5) {
            ideas.push({
              title: columns[1] || '',
              category: columns[2] || '',
              summary: columns[3] || '',
              description: columns[4] || '',
              votes: 0
            });
          } else if (columns.length >= 4) {
            // Handle older format without summary
            ideas.push({
              title: columns[1] || '',
              category: columns[2] || '',
              summary: '',
              description: columns[3] || '',
              votes: 0
            });
          }
        }
        
        console.log("Parsed ideas before validation:", ideas);

        // Filter out invalid entries
        const validIdeas = ideas.filter(idea => {
          const isValid = idea.title && idea.category && idea.summary && 
                          validCategories.includes(idea.category);
          return isValid;
        });
        
        console.log("Valid ideas after filtering:", validIdeas);

        if (validIdeas.length === 0) {
          throw new Error("No valid ideas found in CSV. Make sure the format matches the export format.");
        }

        // Insert ideas into database
        const { error } = await supabase
          .from('ideas')
          .insert(validIdeas);

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        await queryClient.invalidateQueries({ queryKey: ['ideas'] });
        
        toast({
          title: "Import Successful",
          description: `${validIdeas.length} ideas have been imported`,
        });
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing ideas:', error);
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import ideas",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "There are no ideas to export",
        });
        return;
      }

      // Create CSV content
      const headers = ['id', 'title', 'category', 'summary', 'description', 'votes', 'created_at'];
      const csvContent = [
        headers.join(','),
        ...data.map(idea => 
          headers.map(header => {
            // Properly quote and escape values
            const value = String(idea[header as keyof typeof idea] || '');
            return `"${value.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ideas_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: `${data.length} ideas have been exported`,
      });
    } catch (error) {
      console.error('Error exporting ideas:', error);
      toast({
        title: "Export Error",
        description: "Failed to export ideas",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Submit Your Idea</h1>
          <p className="text-gray-400">Share your innovative ideas with the community</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#333333] p-6 border-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
                  Title <span className="text-[#ea384c]">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the title of your idea"
                  className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white mb-1">
                  Category <span className="text-[#ea384c]">*</span>
                </label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-[#444444] border-0 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {validCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-white mb-1">
                  Summary <span className="text-[#ea384c]">*</span>
                </label>
                <Input
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter a brief summary of your idea"
                  className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your idea in detail (optional)"
                  rows={4}
                  className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Idea"}
              </Button>
              
              {isAdmin && (
                <div className="pt-4 border-t border-[#444444] mt-6 space-y-4">
                  <p className="text-sm text-gray-300 font-medium">Admin Actions</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      onChange={handleImportCSV}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1 bg-[#444444] text-white border-[#555555] hover:bg-[#555555]"
                      onClick={handleFileSelection}
                      disabled={isImporting}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isImporting ? "Importing..." : "Import CSV"}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1 bg-[#444444] text-white border-[#555555] hover:bg-[#555555]"
                      onClick={handleExportCSV}
                      disabled={isExporting}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExporting ? "Exporting..." : "Export CSV"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
