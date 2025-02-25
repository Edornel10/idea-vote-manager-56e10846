
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Index() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First check if user exists and get their hashed password
      const { data: userData, error: userError } = await supabase
        .from('auth_users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (userError) {
        console.error('User fetch error:', userError);
        toast.error("An error occurred while fetching user data");
        return;
      }

      if (!userData) {
        toast.error("Invalid username or password");
        return;
      }

      // Call the verify_password function
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('verify_password', {
          input_password: password,
          stored_hash: userData.password
        });

      if (verifyError) {
        console.error('Password verification error:', verifyError);
        toast.error("Error verifying password");
        return;
      }

      if (!verifyData) {
        toast.error("Invalid username or password");
        return;
      }

      // If password is correct, get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (roleError) {
        console.error('Role fetch error:', roleError);
        toast.error("Error fetching user role");
        return;
      }

      if (!roleData) {
        console.error('No role found for user');
        toast.error("No role assigned to user");
        return;
      }
      
      // Set session data
      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        username: userData.username,
        role: roleData.role
      }));
      
      toast.success("Successfully logged in!");
      navigate("/browse");
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error("An error occurred during login");
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
