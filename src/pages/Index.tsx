
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('auth_users')
        .select()
        .eq('username', username)
        .single();

      if (isLogin) {
        if (!data || data.password !== password) {
          toast.error("Invalid username or password");
          return;
        }
        
        // Set session data
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          username: data.username
        }));
        
        toast.success("Successfully logged in!");
        navigate("/browse");
      } else {
        // Check if username already exists
        if (data) {
          toast.error("Username already taken");
          return;
        }

        // Create new user
        const { error: insertError } = await supabase
          .from('auth_users')
          .insert([
            { username, password }
          ]);

        if (insertError) throw insertError;

        toast.success("Successfully signed up! You can now login.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
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
          <h1 className="text-4xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Log in to continue" : "Sign up to get started"}
          </p>
        </motion.div>

        <Card className="bg-[#333333] p-6 border-0">
          <form onSubmit={handleAuth} className="space-y-4">
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
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
