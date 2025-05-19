'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { formatDate } from '@/lib/utils';
import { deleteEmployee } from '@/lib/actions/employee-actions';

interface EmployeeCardProps {
  employee: {
    id: string;
    joinDate: Date;
    position: string;
    department: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  canEdit: boolean;
  canDelete: boolean;
}

export function EmployeeCard({
  employee,
  canEdit,
  canDelete,
}: EmployeeCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle delete
  async function handleDelete() {
    try {
      setIsDeleting(true);
      const result = await deleteEmployee(employee.id);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Employee deleted successfully');
        router.push('/dashboard/employees');
        router.refresh();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={employee.user.image || ''} alt={employee.user.name || ''} />
          <AvatarFallback className="text-lg">{getInitials(employee.user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-2xl">{employee.user.name}</CardTitle>
          <CardDescription className="text-base">{employee.position}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
            <p>{employee.user.email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Department</h4>
            <p>{employee.department}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Join Date</h4>
            <p>{formatDate(employee.joinDate.toISOString())}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Employee ID</h4>
            <p className="font-mono text-sm">{employee.id}</p>
          </div>
        </div>
      </CardContent>
      {(canEdit || canDelete) && (
        <>
          <Separator />
          <CardFooter className="flex justify-end gap-2 pt-4">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/employees/edit/${employee.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Employee Record</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this employee record?
                      This will delete all associated data, including salary history.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
