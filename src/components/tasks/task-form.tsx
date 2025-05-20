"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createTask, updateTask, getEmployeesForAssignment } from "@/lib/actions/task-actions";
import { Loader2, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the form schema with Zod
const taskFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, {
    message: "Task title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  projectId: z.string({
    required_error: "Please select a project.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    required_error: "Please select a priority level.",
  }),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"], {
    required_error: "Please select a status.",
  }),
  assignedToId: z.string().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface Project {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface TaskFormProps {
  task?: {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    projectId: string;
    project: Project;
    assignedToId: string | null;
    assignedTo: {
      id: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
    } | null;
  };
  projects: Project[];
  defaultProjectId?: string;
  userRole?: string;
}

export function TaskForm({ task, projects, defaultProjectId, userRole }: TaskFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Initialize form with default values or existing task data
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      id: task?.id,
      title: task?.title || "",
      description: task?.description || "",
      projectId: task?.projectId || defaultProjectId || "",
      priority: task?.priority || "MEDIUM",
      status: task?.status || "TODO",
      assignedToId: task?.assignedToId || null,
    },
  });

  // Fetch employees for assignment
  useEffect(() => {
    const fetchEmployees = async () => {
      const result = await getEmployeesForAssignment();
      if (result.employees && !result.error) {
        setEmployees(result.employees);
      }
    };
    
    // Only fetch employees if user is admin or manager (can assign tasks)
    if (userRole === "ADMIN" || userRole === "MANAGER") {
      fetchEmployees();
    }
  }, [userRole]);

  // Check if user is an employee to limit editable fields
  const isEmployee = userRole === "EMPLOYEE";

  // Form submission handler
  async function onSubmit(data: TaskFormValues) {
    setIsSubmitting(true);
    setError(null);
    
    // Create a FormData object for server action
    const formData = new FormData();
    if (data.id) formData.append("id", data.id);
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("projectId", data.projectId);
    formData.append("priority", data.priority);
    formData.append("status", data.status);
    if (data.assignedToId) {
      formData.append("assignedToId", data.assignedToId);
    }
    
    // Submit the form data to the appropriate server action
    try {
      const result = data.id 
        ? await updateTask(formData)
        : await createTask(formData);
      console.log("Task created/updated successfully:", result);
      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      
      // Redirect to the task detail page or project detail page
      if (result.taskId) {
        router.push(`/dashboard/tasks/${result.taskId}`);
      } else if (data.projectId) {
        router.push(`/dashboard/projects/${data.projectId}`);
      } else {
        router.push("/dashboard/tasks");
      }
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  // Get the initials for the avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? "Edit Task" : "Create New Task"}</CardTitle>
        <CardDescription>
          {task 
            ? "Update the task details" 
            : "Enter the details for your new task"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Task Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task title" 
                      {...field} 
                      
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Task Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the task details"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                      // disabled={isEmployee && task}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Project Selection */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    // disabled={isEmployee && task}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      // disabled={isEmployee && task}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Assigned To - Only shown for admin/managers */}
            {(userRole === "ADMIN" || userRole === "MANAGER") && (
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {employee.user.image && (
                                  <AvatarImage src={employee.user.image} />
                                )}
                                <AvatarFallback>
                                  {getInitials(employee.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              {employee.user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Assign this task to a specific employee
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Error Message */}
            {error && (
              <div className="text-destructive text-sm font-medium py-2">
                {error}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between mt-9">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {task ? "Update Task" : "Create Task"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
