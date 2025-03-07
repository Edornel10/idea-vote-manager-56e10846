
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { getUsers, createUser, deleteUser } from "@/integrations/mariadb/client";

interface User {
  id: string;
  username: string;
  role: 'admin' | 'standard';
}

export default function UserManagement() {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<'admin' | 'standard'>('standard');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const data = await getUsers();
        return Array.isArray(data) ? data as User[] : [];
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    }
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createUser({
        username: newUsername,
        password: newPassword,
        role: newRole
      });

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
      await deleteUser(userId);
      toast.success("User deleted successfully");
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
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
        
        // Parse CSV rows into user objects
        const usersToImport = [];
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
          
          // The export format includes id, username, role
          // For import, we need username, password, role
          // Since we can't import password hashes directly, we set a default password
          // that admins would need to reset later
          if (columns.length >= 3) {
            const username = columns[1];
            const role = columns[2] as 'admin' | 'standard';
            
            // Only accept valid roles
            if (role !== 'admin' && role !== 'standard') {
              console.warn(`Skipping user with invalid role: ${role}`);
              continue;
            }
            
            usersToImport.push({
              username,
              password: 'ChangeMe123!',
              role
            });
          }
        }
        
        console.log("Users to import:", usersToImport);

        // Filter out invalid entries
        const validUsers = usersToImport.filter(user => {
          return user.username && user.password && (user.role === 'admin' || user.role === 'standard');
        });
        
        if (validUsers.length === 0) {
          throw new Error("No valid users found in CSV. Make sure the format matches the export format.");
        }

        // Insert users into database
        for (const user of validUsers) {
          await createUser(user);
        }

        await refetch();
        
        toast.success(`${validUsers.length} users have been imported with default password 'ChangeMe123!'`);
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error(error instanceof Error ? error.message : "Failed to import users");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);

    try {
      const data = await getUsers();
      const usersArray = Array.isArray(data) ? data : [];
      
      if (!usersArray || usersArray.length === 0) {
        toast.error("There are no users to export");
        return;
      }

      // Create CSV content
      const headers = ['id', 'username', 'role'];
      const csvContent = [
        headers.join(','),
        ...usersArray.map((user: any) => 
          headers.map(header => {
            // Properly quote and escape values
            const value = String(user[header] || '');
            return `"${value.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${usersArray.length} users have been exported`);
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error("Failed to export users");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto pt-16">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-[#333333] p-6 border-0">
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
                {isImporting ? "Importing..." : "Import Users"}
              </Button>
              <Button 
                type="button"
                variant="outline"
                className="flex-1 bg-[#444444] text-white border-[#555555] hover:bg-[#555555]"
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Users"}
              </Button>
            </div>
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
