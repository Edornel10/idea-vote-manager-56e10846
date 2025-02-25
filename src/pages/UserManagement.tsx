
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  role: 'admin' | 'standard';
}

export default function UserManagement() {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<'admin' | 'standard'>('standard');

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role');
      
      if (error) throw error;
      return data as User[];
    }
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data: passwordHash } = await supabase.rpc('hash_password', {
        password: newPassword
      });

      const { error } = await supabase
        .from('users')
        .insert([
          {
            username: newUsername,
            password_hash: passwordHash,
            role: newRole
          }
        ]);

      if (error) throw error;

      toast.success("User added successfully");
      setNewUsername("");
      setNewPassword("");
      setNewRole('standard');
      refetch();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("Failed to add user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success("User deleted successfully");
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage users and their roles</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-[#333333] p-6 border-0">
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Username
                  </label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-[#444444] border-0 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Role
                </label>
                <Select value={newRole} onValueChange={(value: 'admin' | 'standard') => setNewRole(value)}>
                  <SelectTrigger className="bg-[#444444] border-0 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
              >
                Add User
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div 
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {users.map((user) => (
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
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-gray-400 hover:text-[#ea384c] hover:bg-[#ea384c]/10"
                    >
                      Delete
                    </Button>
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
