'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createEmployee, updateEmployee } from '@/lib/actions/employee-actions';

// Define the form schema
const employeeFormSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  joinDate: z.date({
    required_error: 'Join date is required',
  }),
  baseSalary: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Base salary must be a positive number',
  }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface EmployeeFormProps {
  users?: User[];
  employee?: {
    id: string;
    userId: string;
    position: string;
    department: string;
    joinDate: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
  departments?: string[];
}

export function EmployeeForm({
  users = [],
  employee,
  departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'],
}: EmployeeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employee
      ? {
          userId: employee.userId,
          position: employee.position,
          department: employee.department,
          joinDate: new Date(employee.joinDate),
          baseSalary: '0', // Not editable for existing employees
        }
      : {
          userId: '',
          position: '',
          department: '',
          joinDate: new Date(),
          baseSalary: '',
        },
  });

  // Handle form submission
  async function onSubmit(values: EmployeeFormValues) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      if (employee) {
        // Update existing employee
        formData.append('id', employee.id);
        formData.append('position', values.position);
        formData.append('department', values.department);
        
        const result = await updateEmployee(formData);
        
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Employee updated successfully');
          router.push(`/dashboard/employees/${employee.id}`);
          router.refresh();
        }
      } else {
        // Create new employee
        formData.append('userId', values.userId);
        formData.append('position', values.position);
        formData.append('department', values.department);
        formData.append('joinDate', values.joinDate.toISOString());
        formData.append('baseSalary', values.baseSalary);
        
        const result = await createEmployee(formData);
        
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Employee created successfully');
          router.push(`/dashboard/employees/${result.employeeId}`);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!employee && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!!employee || isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.length === 0 ? (
                      <SelectItem value="no-users" disabled>
                        No available users
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the user to create an employee record for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Software Engineer" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!employee && (
          <>
            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Annual base salary amount (before bonuses or deductions).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
