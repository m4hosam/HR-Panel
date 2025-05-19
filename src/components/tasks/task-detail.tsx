"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { deleteTask, updateTask } from "@/lib/actions/task-actions";
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  Clock, 
  Edit, 
  FilePenLine, 
  Link2, 
  Loader2, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  UserCheck 
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@prisma/client";

interface TaskDetailProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    projectId: string;
    project: {
      id: string;
      name: string;
      status: string;
    };
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
    createdAt: Date;
    updatedAt: Date;
  };
  userRole: string;
  userId: string;
}

// Map task priority to color and icon
const priorityConfig = {
  LOW: { color: "bg-gray-100 text-gray-800", icon: null },
  MEDIUM: { color: "bg-blue-100 text-blue-800", icon: null },
  HIGH: { color: "bg-amber-100 text-amber-800", icon: null },
  CRITICAL: { color: "bg-red-100 text-red-800", icon: null },
};

// Map task status to color and icon
const statusConfig = {
  TODO: { 
    color: "bg-gray-100 text-gray-800", 
    icon: <Clock className="h-3.5 w-3.5 mr-1" />,
    label: "To Do"
  },
  IN_PROGRESS: { 
    color: "bg-blue-100 text-blue-800", 
    icon: <Clock className="h-3.5 w-3.5 mr-1" />,
    label: "In Progress"
  },
  REVIEW: { 
    color: "bg-amber-100 text-amber-800", 
    icon: <FilePenLine className="h-3.5 w-3.5 mr-1" />,
    label: "Review" 
  },
  DONE: { 
    color: "bg-green-100 text-green-800", 
    icon: <Check className="h-3.5 w-3.5 mr-1" />,
    label: "Done"
  },
};

export function TaskDetail({ task, userRole, userId }: TaskDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  
  // Handle task deletion
  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await deleteTask(task.id);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      router.push(`/dashboard/projects/${task.projectId}`);
      router.refresh();
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create form data with necessary fields
      const formData = new FormData();
      formData.append("id", task.id);
      formData.append("title", task.title);
      formData.append("description", task.description || "");
      formData.append("projectId", task.projectId);
      formData.append("priority", task.priority);
      formData.append("status", newStatus);
      if (task.assignedToId) {
        formData.append("assignedToId", task.assignedToId);
      }
      
      const result = await updateTask(formData);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setShowStatusSheet(false);
      router.refresh();
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user can edit this task
  const canEdit = userRole === "ADMIN" || userRole === "MANAGER" || 
    (userRole === "EMPLOYEE" && task.assignedTo?.user.id === userId);
  
  // Check if user can change status (even employees can update the status)
  const canChangeStatus = userRole === "ADMIN" || userRole === "MANAGER" || 
    (userRole === "EMPLOYEE" && task.assignedTo?.user.id === userId);
  
  // Check if user can delete the task (only admin and manager)
  const canDelete = userRole === "ADMIN" || userRole === "MANAGER";
  
  // Get initials for avatar fallback
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
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            {canChangeStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusSheet(true)}
              >
                <Clock className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            )}
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/dashboard/tasks/edit/${task.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Task
                </Link>
              </Button>
            )}
            
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main task details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="outline" 
                  className={cn("flex items-center", statusConfig[task.status].color)}
                >
                  {statusConfig[task.status].icon}
                  {statusConfig[task.status].label}
                </Badge>
                
                <Badge 
                  variant="outline" 
                  className={cn(priorityConfig[task.priority].color)}
                >
                  {task.priority} Priority
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="mt-1 whitespace-pre-wrap">
                  {task.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Project</h3>
                <Link 
                  href={`/dashboard/projects/${task.project.id}`}
                  className="inline-flex items-center mt-1 hover:underline"
                >
                  <Link2 className="mr-1.5 h-3.5 w-3.5" />
                  {task.project.name}
                </Link>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                  <p className="mt-1">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                  <p className="mt-1">
                    {formatDate(task.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sidebar with assignment info */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
              <CardDescription>
                Task assignment details
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Assigned To</h3>
                  {task.assignedTo ? (
                    <div className="flex items-center gap-3 mt-2">
                      <Avatar>
                        {task.assignedTo.user.image && (
                          <AvatarImage src={task.assignedTo.user.image} />
                        )}
                        <AvatarFallback>
                          {getInitials(task.assignedTo.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{task.assignedTo.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.assignedTo.user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2 italic">
                      Not assigned to anyone
                    </div>
                  )}
                </div>
                
                {/* Additional information can be added here */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Task Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently deleted
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Update Status Sheet */}
      <Sheet open={showStatusSheet} onOpenChange={setShowStatusSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Update Task Status</SheetTitle>
            <SheetDescription>
              Change the status of this task
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-6">
            <div className="space-y-4">
              {(Object.keys(statusConfig) as Array<TaskStatus>).map((statusKey) => (
                <Button
                  key={statusKey}
                  variant={task.status === statusKey ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleStatusChange(statusKey)}
                  disabled={isLoading || task.status === statusKey}
                >
                  {statusConfig[statusKey].icon}
                  {statusConfig[statusKey].label}
                </Button>
              ))}
            </div>
            
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowStatusSheet(false)}
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
