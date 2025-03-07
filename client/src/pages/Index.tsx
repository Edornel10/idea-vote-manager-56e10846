
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#222222] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-lg p-8 bg-[#333333] border-0">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Ideas Platform
            </h1>
            <p className="text-gray-400 mb-8">
              Explore innovative ideas, share your thoughts, and vote for your favorites
            </p>
            <div className="flex flex-col gap-4">
              <Button
                className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-lg py-6"
                onClick={() => navigate("/browse")}
              >
                Browse Ideas
              </Button>
              <Button
                className="bg-[#444444] hover:bg-[#444444]/90 text-lg py-6"
                onClick={() => navigate("/create")}
              >
                Submit an Idea
              </Button>
              <Button
                className="bg-[#444444] hover:bg-[#444444]/90 text-lg py-6"
                onClick={() => navigate("/vote")}
              >
                Vote on Ideas
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
