'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  Edit,
  Plus,
  Save,
  Trash,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

import { formatCurrency } from '@/lib/utils';
import { saveSalaryRecord, deleteSalaryRecord } from '@/lib/actions/salary-actions';

// Define the form schema
const salaryFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(4, 'Year is required'),
  baseSalary: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Base salary must be a non-negative number',
  }),
  bonus: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Bonus must be a non-negative number',
  }),
  deductions: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Deductions must be a non-negative number',
  }),
});

type SalaryFormValues = z.infer<typeof salaryFormSchema>;

// Type for salary record
interface SalaryRecord {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  totalSalary: number;
}

interface SalaryTableProps {
  employeeId: string;
  employeeName: string;
  salaryRecords: SalaryRecord[];
  availableYears: number[];
  isAdmin: boolean;
  canEdit: boolean;
}

// Month names for display
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function SalaryTable({
  employeeId,
  employeeName,
  salaryRecords,
  availableYears,
  isAdmin,
  canEdit,
}: SalaryTableProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based

  // State for years to display
  const availableYearOptions = availableYears.length > 0 
    ? availableYears 
    : [currentYear - 1, currentYear, currentYear + 1];

  // Define form
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      employeeId,
      month: currentMonth.toString(),
      year: currentYear.toString(),
      baseSalary: '0',
      bonus: '0',
      deductions: '0',
    },
  });

  // Handle form submission
  async function onSubmit(values: SalaryFormValues) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('employeeId', values.employeeId);
      formData.append('month', values.month);
      formData.append('year', values.year);
      formData.append('baseSalary', values.baseSalary);
      formData.append('bonus', values.bonus);
      formData.append('deductions', values.deductions);
      
      const result = await saveSalaryRecord(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Salary record saved successfully');
        setIsDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete salary record
  async function handleDelete(id: string) {
    try {
      const result = await deleteSalaryRecord(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Salary record deleted successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    }
  }

  // Calculate the total
  const salaryTotal = salaryRecords.reduce((sum, record) => sum + record.totalSalary, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Salary Information - {employeeName}</h3>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Salary Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Salary Record</DialogTitle>
                <DialogDescription>
                  Create a new salary record for {employeeName}.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {monthNames.map((month, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableYearOptions.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="baseSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="e.g. 5000"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="e.g. 1000"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deductions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deductions</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="e.g. 500"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Salary Record'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Base Salary</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Total</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8">
                  No salary records found
                </TableCell>
              </TableRow>
            ) : (
              salaryRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{monthNames[record.month - 1]}</TableCell>
                  <TableCell>{record.year}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.baseSalary)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.bonus)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.deductions)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(record.totalSalary)}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit functionality would go here */}
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Salary Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this salary record?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(record.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {salaryRecords.length > 0 && (
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="text-right font-medium">
                  Total:
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(salaryTotal)}
                </TableCell>
                {canEdit && <TableCell />}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
