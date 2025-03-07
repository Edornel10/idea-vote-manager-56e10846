
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onAuthenticate: (isValid: boolean) => void;
}

export const VOTING_PASSWORD = "ideas123"; // In a real app, this would be stored securely

export function AuthForm({ onAuthenticate }: AuthFormProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleAuthenticate = () => {
    if (password === VOTING_PASSWORD) {
      onAuthenticate(true);
      toast({
        title: "Success!",
        description: "You can now vote for ideas.",
      });
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="bg-[#333333] p-6 border-0">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Enter Voting Password</h2>
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
            />
            <Button
              className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
              onClick={handleAuthenticate}
            >
              Access Voting
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
