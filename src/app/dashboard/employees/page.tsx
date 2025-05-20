import { Metadata } from 'next';
import { getCurrentSession } from '@/auth';
import { hasPermission } from '@/lib/constants/roles';

import { getEmployees } from '@/lib/actions/employee-actions';
import { EmployeeList } from '@/components/employees/employee-list';

export const metadata: Metadata = {
  title: 'Employees | HR Management',
  description: 'Manage your company employees',
};

interface EmployeesPageProps {
  searchParams: {
    search?: string;
    page?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  // Get the current session
  const session = await getCurrentSession();
  
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }
  
  // Check if user has permission to view employees
  const canViewEmployees = hasPermission(session.user.role, 'employees', 'read');
  const canCreateEmployee = hasPermission(session.user.role, 'employees', 'create');
  
  if (!canViewEmployees) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view employees.
        </p>
      </div>
    );
  }
  
  // Get search and pagination parameters
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const sortBy = searchParams.sortBy || 'name';
  const sortDirection = searchParams.sortDirection || 'asc';
  
  // Get employees
  const { employees = [], pagination = { total: 0, pages: 1, page: 1, limit: 10 }, error } = await getEmployees({
    page,
    search,
    sortBy,
    sortDirection: sortDirection as 'asc' | 'desc',
  });
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Employees</h1>
      </div>
      
      <EmployeeList
        initialEmployees={employees}
        pagination={pagination}
        canCreate={canCreateEmployee}
      />
    </div>
  );
} 