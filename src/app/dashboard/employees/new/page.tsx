import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/auth';
import { hasPermission } from '@/lib/constants/roles';
import { prisma } from '@/lib/prisma';
import { filterAvailableUsers } from '@/lib/utils';

import { EmployeeForm } from '@/components/employees/employee-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Add Employee | HR Management',
  description: 'Add a new employee to the system',
};

export default async function AddEmployeePage() {
  // Get the current session
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Check if user has permission to create employees
  const canCreateEmployee = hasPermission(session.user.role, 'employees', 'create');
  
  if (!canCreateEmployee) {
    redirect('/dashboard/employees');
  }
  
  // Get all users who don't already have an employee record
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  
  // Get all users who already have employee records
  const employeeUsers = await prisma.employee.findMany({
    select: {
      userId: true,
    },
  });
  
  const employeeUserIds = employeeUsers.map(e => e.userId);
  
  // Filter out users who already have employee records
  const availableUsers = filterAvailableUsers(users, employeeUserIds);
  
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
        <h1 className="text-3xl font-bold">Add Employee</h1>
        <p className="text-muted-foreground">
          Create a new employee record
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
          <CardDescription>
            Enter the details of the new employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            users={availableUsers}
            departments={departments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
