"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateTask } from "@/lib/actions/task-actions";
import { PlusCircle, Loader2, Clock, Check, FilePenLine, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Define types for the component
interface KanbanProps {
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: {
      id: string;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
      };
    } | null;
    projectId: string;
    project?: {
      id: string;
      name: string;
    };
  }>;
  userRole: string;
  projectId?: string;
  refreshTasks?: () => void;
}

// Map task priority to color
const priorityConfig = {
  'LOW': { color: "bg-gray-100 text-gray-800" },
  'MEDIUM': { color: "bg-blue-100 text-blue-800" },
  'HIGH': { color: "bg-amber-100 text-amber-800" },
  'CRITICAL': { color: "bg-red-100 text-red-800" },
};

// Define columns with their ids, titles and icons
const columns = [
  { 
    id: "TODO", 
    title: "To Do", 
    icon: <Clock className="h-4 w-4 mr-2" /> 
  },
  { 
    id: "IN_PROGRESS", 
    title: "In Progress",
    icon: <Clock className="h-4 w-4 mr-2 text-blue-500" />
  },
  { 
    id: "REVIEW", 
    title: "Review",
    icon: <FilePenLine className="h-4 w-4 mr-2 text-amber-500" />
  },
  { 
    id: "DONE", 
    title: "Done",
    icon: <Check className="h-4 w-4 mr-2 text-green-500" />
  }
];

export function KanbanBoard({ tasks, userRole, projectId, refreshTasks }: KanbanProps) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Function to get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Handle task drag and drop
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    // Drop outside a droppable area or same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get the task that was moved
    const taskId = draggableId;
    const task = localTasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Set loading for this task
    setLoading(taskId);
    setError(null);
    
    // Update the local state optimistically
    const newTasks = localTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: destination.droppableId as TaskStatus };
      }
      return t;
    });
    
    setLocalTasks(newTasks);
    
    // Create FormData for the task update
    const formData = new FormData();
    formData.append("id", taskId);
    formData.append("title", task.title);
    formData.append("description", task.description || "");
    formData.append("projectId", task.projectId);
    formData.append("priority", task.priority);
    formData.append("status", destination.droppableId); // New status
    if (task.assignedTo) {
      formData.append("assignedToId", task.assignedTo.id);
    }
    
    // Update the task in the database
    try {
      const result = await updateTask(formData);
      
      if (result.error) {
        setError(result.error);
        // Revert optimistic update
        setLocalTasks(tasks);
      } else {
        // Update successful
        if (refreshTasks) {
          refreshTasks();
        }
      }
    } catch (err) {
      setError("Failed to update task status");
      // Revert optimistic update
      setLocalTasks(tasks);
    } finally {
      setLoading(null);
    }
  };
  
  // Group tasks by status
  const tasksByStatus = columns.reduce((acc: any, column) => {
    acc[column.id] = localTasks.filter(task => task.status === column.id);
    return acc;
  }, {});
  
  return (
    <div className="flex flex-col space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          {columns.map(column => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {column.icon}
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="outline" className="ml-2">
                    {tasksByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
                
                {(userRole === "ADMIN" || userRole === "MANAGER") && column.id === "TODO" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <Link href={`/dashboard/tasks/new${projectId ? `?projectId=${projectId}` : ''}`}>
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Add new task</span>
                    </Link>
                  </Button>
                )}
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-muted/50 p-3 rounded-lg flex-1 min-h-[500px]"
                  >
                    {tasksByStatus[column.id]?.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-4 text-center border-2 border-dashed rounded-md">
                        No tasks in this column
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasksByStatus[column.id]?.map((task: any, index: number) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                            isDragDisabled={!!loading}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "shadow-sm hover:shadow transition-shadow",
                                  loading === task.id ? "opacity-60" : ""
                                )}
                              >
                                <CardContent className="p-3">
                                  <Link href={`/dashboard/tasks/${task.id}`}>
                                    <h4 className="font-medium mb-2 hover:underline">
                                      {task.title}
                                    </h4>
                                  </Link>
                                  
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={cn(priorityConfig['LOW'].color)}>
                                      {task.priority}
                                    </Badge>
                                    
                                    {task.assignedTo ? (
                                      <Avatar className="h-6 w-6">
                                        {task.assignedTo.user.image && (
                                          <AvatarImage src={task.assignedTo.user.image} />
                                        )}
                                        <AvatarFallback>
                                          {getInitials(task.assignedTo.user.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">Unassigned</span>
                                    )}
                                  </div>
                                </CardContent>
                                
                                {task.project && (
                                  <CardFooter className="p-3 pt-0 flex items-center text-xs text-muted-foreground">
                                    <Link 
                                      href={`/dashboard/projects/${task.project.id}`}
                                      className="hover:underline"
                                    >
                                      {task.project.name}
                                    </Link>
                                  </CardFooter>
                                )}
                                
                                {loading === task.id && (
                                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  </div>
                                )}
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
