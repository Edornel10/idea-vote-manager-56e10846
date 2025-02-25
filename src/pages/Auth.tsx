
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_password', {
        username,
        password,
      });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error("Invalid username or password");
        return;
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data[0].id,
        role: data[0].role
      }));

      toast.success("Login successful");
      navigate('/browse');
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#333333] border-0 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#333333] border-0 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
