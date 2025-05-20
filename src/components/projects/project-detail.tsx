"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Folder, 
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
} from "@/components/ui/alert-dialog";
import { deleteProject } from "@/lib/actions/project-actions";

// Define the types for the project data
interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: {
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    }
  } | null;
  createdAt: Date;
}

interface ProjectDetailProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    status: ProjectStatus;
    tasks: Task[];
    totalTasks: number;
    completedTasks: number;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
  };
  canUpdate: boolean;
  canDelete: boolean;
}

export function ProjectDetail({ project, canUpdate, canDelete }: ProjectDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get status badge color
  const getStatusBadgeColor = (status: ProjectStatus) => {
    switch (status) {
      case "PLANNING":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "ON_HOLD":
        return "bg-orange-100 text-orange-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: TaskPriority) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get task status badge color
  const getTaskStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEW":
        return "bg-purple-100 text-purple-800";
      case "DONE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProject(project.id);
      if (result.success) {
        router.push("/dashboard/projects");
        router.refresh();
      } else {
        console.error("Failed to delete project:", result.error);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2 max-w-3xl">{project.description}</p>
          )}
        </div>

        {/* Actions dropdown */}
        {(canUpdate || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canUpdate && (
                <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/edit/${project.id}`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this project and all associated tasks.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteProject} 
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Project info and stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project status and progress */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={getStatusBadgeColor(project.status)}>
                {project.status.replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {project.progress}% complete
              </span>
            </div>
            <Progress value={project.progress} />
            <div className="pt-2 flex justify-between items-center text-sm text-muted-foreground">
              <span>{project.completedTasks} of {project.totalTasks} tasks completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Project timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(project.startDate.toString())}
                </p>
              </div>
            </div>
            {project.endDate && (
              <div className="flex gap-4">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(project.endDate.toString())}
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {project.endDate ? (
                    `${Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                  ) : (
                    "Ongoing"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Folder className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(project.createdAt.toString())}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(project.updatedAt.toString())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks section */}
      <div>
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="todo">To Do</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <Button onClick={() => router.push(`/dashboard/tasks/new?projectId=${project.id}`)}>
              Add Task
            </Button>
          </div>

          <TabsContent value="all">
            {project.tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {project.tasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    statusColor={getTaskStatusBadgeColor} 
                    priorityColor={getPriorityBadgeColor}
                  />
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No tasks yet</AlertTitle>
                <AlertDescription>
                  This project does not have any tasks. Add tasks to track your progress.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="todo">
            {project.tasks.filter(task => task.status === 'TODO').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {project.tasks
                  .filter(task => task.status === 'TODO')
                  .map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      statusColor={getTaskStatusBadgeColor} 
                      priorityColor={getPriorityBadgeColor}
                    />
                  ))}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No to-do tasks</AlertTitle>
                <AlertDescription>
                  There are no tasks in the to-do state.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {project.tasks.filter(task => task.status === 'IN_PROGRESS').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {project.tasks
                  .filter(task => task.status === 'IN_PROGRESS')
                  .map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      statusColor={getTaskStatusBadgeColor} 
                      priorityColor={getPriorityBadgeColor}
                    />
                  ))}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No in-progress tasks</AlertTitle>
                <AlertDescription>
                  There are no tasks currently in progress.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {project.tasks.filter(task => task.status === 'DONE').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {project.tasks
                  .filter(task => task.status === 'DONE')
                  .map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      statusColor={getTaskStatusBadgeColor} 
                      priorityColor={getPriorityBadgeColor}
                    />
                  ))}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No completed tasks</AlertTitle>
                <AlertDescription>
                  There are no completed tasks for this project.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: Task;
  statusColor: (status: TaskStatus) => string;
  priorityColor: (priority: TaskPriority) => string;
}

function TaskCard({ task, statusColor, priorityColor }: TaskCardProps) {
  const router = useRouter();
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-1">{task.title}</CardTitle>
        <div className="flex gap-2">
          <Badge className={statusColor(task.status)}>
            {task.status.replace("_", " ")}
          </Badge>
          <Badge className={priorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center">
            {task.assignedTo ? (
              <span>
                Assigned to {task.assignedTo.user.name}
              </span>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
          <div>{formatDate(task.createdAt.toString(), "MMM d, yyyy")}</div>
        </div>
      </CardFooter>
    </Card>
  );
}
