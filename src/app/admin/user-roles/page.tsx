import { Metadata } from 'next';
import { getUsers } from '@/lib/actions/user-actions';
import { UserRoleForm } from '@/components/admin/user-role-form';

export const metadata: Metadata = {
  title: 'User Role Management | HR Management',
  description: 'Manage user roles in the HR Management system',
};

export default async function UserRoleManagementPage() {
  // Fetch all users
  const { users, error } = await getUsers({
    limit: 100, // Fetch a large number to avoid pagination initially
  });
  
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">User Role Management</h1>
          <p className="text-muted-foreground">
            Update user roles to control access to the system
          </p>
        </div>
        
        {error ? (
          <div className="rounded-md bg-destructive/15 p-4 text-center">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-md bg-muted p-4 text-center">
            <p className="text-muted-foreground">No users found in the system.</p>
          </div>
        ) : (
          <UserRoleForm users={users} />
        )}
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Role Permissions:</p>
          <ul className="list-disc list-inside mt-2">
            <li><strong>Administrator:</strong> Full access to all system features</li>
            <li><strong>Manager:</strong> Access to manage projects, tasks, and employees</li>
            <li><strong>Employee:</strong> Limited access to personal information and assigned tasks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
