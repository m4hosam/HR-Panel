import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentSession } from '@/auth';
import { hasPermission, ROLES } from '@/lib/constants/roles';

import { getEmployeeById } from '@/lib/actions/employee-actions';
import { EmployeeForm } from '@/components/employees/employee-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Edit Employee | HR Management',
  description: 'Edit employee information',
};

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  // Get the current session
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Check if user has permission to edit employees
  const canEditEmployee = hasPermission(session.user.role, 'employees', 'update');
  
  // Get employee details
  const { employee, error } = await getEmployeeById(params.id);
  
  if (error || !employee) {
    notFound();
  }
  
  // Check if the employee belongs to the current user (for employee role)
  const isOwnProfile = session.user.role === ROLES.EMPLOYEE && 
                       employee.userId === session.user.id;
  
  // Only allow editing if admin, manager, or the employee's own profile
  if (!canEditEmployee || (session.user.role === ROLES.EMPLOYEE && !isOwnProfile)) {
    redirect(`/dashboard/employees/${params.id}`);
  }
  
  // Define department options
  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Finance',
    'HR',
    'Operations',
    'Product',
    'Design',
    'Customer Support',
    'Legal',
    'Research',
  ];
  
  return (
    <div className="container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground">
          Update employee information
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Edit details for {employee.user.name || 'employee'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            employee={employee}
            departments={departments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
