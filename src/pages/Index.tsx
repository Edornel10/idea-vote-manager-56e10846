
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserData {
  id: string;
  username: string;
  password: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('auth_users')
        .select()
        .eq('username', username)
        .single();

      if (userError) {
        toast.error("Invalid username or password");
        return;
      }

      // Verify password
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_password', {
          input_password: password,
          stored_hash: user.password
        });

      if (verifyError || !isValid) {
        toast.error("Invalid username or password");
        return;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        toast.error("Error retrieving user role");
        return;
      }

      // Store user session data
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        username: user.username,
        role: roleData.role
      }));

      toast.success("Successfully logged in!");
      navigate("/browse");
    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Log in to continue</p>
        </motion.div>

        <Card className="bg-[#333333] p-6 border-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
            >
              Login
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
