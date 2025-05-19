import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { hasPermission, ROLES } from '@/lib/constants/roles';

import { getEmployeeById } from '@/lib/actions/employee-actions';
import { getEmployeeSalaries } from '@/lib/actions/salary-actions';
import { EmployeeCard } from '@/components/employees/employee-card';
import { SalaryTable } from '@/components/employees/salary-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Employee Details | HR Management',
  description: 'View employee details and salary information',
};

interface EmployeeDetailsPageProps {
  params: {
    id: string;
  };
  searchParams: {
    year?: string;
  };
}

export default async function EmployeeDetailsPage({
  params,
  searchParams,
}: EmployeeDetailsPageProps) {
  // Get the current session
  const session = await auth();
  
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
  
  if (!canViewEmployees) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view employee details.
        </p>
      </div>
    );
  }
  
  // Check if user can edit employees
  const canEditEmployee = hasPermission(session.user.role, 'employees', 'update');
  const canDeleteEmployee = hasPermission(session.user.role, 'employees', 'delete');
  
  // Check if user can edit salaries
  const canEditSalary = hasPermission(session.user.role, 'salaries', 'update');
  const isAdmin = session.user.role === ROLES.ADMIN;
  
  // Get employee details
  const { employee, error: employeeError } = await getEmployeeById(params.id);
  
  if (employeeError || !employee) {
    notFound();
  }
  
  // Get employee salary records
  const year = searchParams.year ? parseInt(searchParams.year, 10) : undefined;
  
  const { salaries = [], years = [], error: salaryError } = await getEmployeeSalaries({
    employeeId: employee.id,
    year,
  });
  
  // Check if the employee belongs to the current user (for employee role)
  const isOwnProfile = session.user.role === ROLES.EMPLOYEE && 
                       employee.userId === session.user.id;
  
  // Only allow editing if admin, manager, or the employee's own profile
  const canEdit = canEditEmployee && (session.user.role !== ROLES.EMPLOYEE || isOwnProfile);
  const canDelete = canDeleteEmployee && session.user.role !== ROLES.EMPLOYEE;
  
  return (
    <div className="container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Employee Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <EmployeeCard
            employee={employee}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="salary">
            <TabsList className="mb-4">
              <TabsTrigger value="salary">Salary Information</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="salary" className="space-y-4">
              <SalaryTable
                employeeId={employee.id}
                employeeName={employee.user.name || 'Employee'}
                salaryRecords={salaries}
                availableYears={years}
                isAdmin={isAdmin}
                canEdit={canEditSalary}
              />
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  Performance tracking coming soon...
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground">
                  Document management coming soon...
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
