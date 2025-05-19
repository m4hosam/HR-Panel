'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROLES, Role } from '@/lib/constants/roles';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updateUserRole } from '@/lib/actions/user-actions';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
}

interface UserRoleFormProps {
  users: User[];
}

export function UserRoleForm({ users }: UserRoleFormProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const nameMatch = user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return nameMatch || emailMatch;
  });
  
  // Select a user
  const handleSelectUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setSelectedUserId(userId);
    setSelectedRole(user?.role || '');
  };
  
  // Update role
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedRole) {
      toast.error('Please select both a user and a role');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await updateUserRole(selectedUserId, selectedRole as Role);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('User role updated successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update User Role</CardTitle>
        <CardDescription>
          Select a user and assign them to a new role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={handleSelectUser}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    No matching users found
                  </SelectItem>
                ) : (
                  filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || 'Unnamed'} ({user.email || 'No email'}) - {user.role}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as Role)}
              disabled={!selectedUserId || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.ADMIN}>Administrator</SelectItem>
                <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                <SelectItem value={ROLES.EMPLOYEE}>Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedUserId || !selectedRole || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
