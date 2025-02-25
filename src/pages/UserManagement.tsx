
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

// Dummy data for users
const dummyUsers = [
  { id: '1', username: 'john_doe', role: 'admin' },
  { id: '2', username: 'jane_smith', role: 'moderator' },
  { id: '3', username: 'mike_wilson', role: 'user' },
  { id: '4', username: 'sarah_jones', role: 'user' },
  { id: '5', username: 'alex_brown', role: 'moderator' },
];

export default function UserManagement() {
  return (
    <div className="min-h-screen bg-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">View all users and their roles</p>
        </motion.div>

        <motion.div 
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {dummyUsers.map((user) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-[#333333] p-6 border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {user.username}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ea384c]/20 text-[#ea384c]">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    ID: {user.id}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
