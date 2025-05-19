"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { getTasks } from "@/lib/actions/task-actions";
import { 
  Calendar, 
  Check, 
  Clock, 
  FilePenLine, 
  Loader2, 
  MoreHorizontal, 
  PlusCircle,
  ClipboardList, 
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

// Define interfaces for the component's props and data
interface TaskListProps {
  initialTasks: any[];
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  userRole: string;
}

interface TaskListData {
  tasks: any[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
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
    icon: <ClipboardList className="h-3.5 w-3.5 mr-1" /> 
  },
  IN_PROGRESS: { 
    color: "bg-blue-100 text-blue-800", 
    icon: <Clock className="h-3.5 w-3.5 mr-1" /> 
  },
  REVIEW: { 
    color: "bg-amber-100 text-amber-800", 
    icon: <FilePenLine className="h-3.5 w-3.5 mr-1" /> 
  },
  DONE: { 
    color: "bg-green-100 text-green-800", 
    icon: <Check className="h-3.5 w-3.5 mr-1" /> 
  },
};

export function TaskList({ initialTasks, totalTasks, currentPage, totalPages, userRole }: TaskListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for task data, loading status, and filters
  const [taskData, setTaskData] = useState<TaskListData>({
    tasks: initialTasks || [],
    pagination: {
      total: totalTasks || 0,
      pages: totalPages || 1,
      page: currentPage || 1,
      limit: 10,
    },
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDirection, setSortDirection] = useState(
    searchParams.get('sortDirection') || 'desc'
  );

  // Function to get user initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Function to fetch tasks with current filters and pagination
  const fetchTasks = async (page: number) => {
    setLoading(true);
    try {
      const result = await getTasks({
        page,
        limit: 10,
        search,
        status,
        priority,
        projectId,
        sortBy,
        sortDirection: sortDirection as 'asc' | 'desc',
      });

      if (!result.error) {
        setTaskData({
          tasks: result.tasks || [],
          pagination: result.pagination || {
            total: 0,
            pages: 1,
            page: 1,
            limit: 10,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL when filters change
  const updateUrl = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    // Replace page in the URL without triggering full page reload
    router.replace(`/dashboard/tasks?${newParams.toString()}`, { scroll: false });
  };

  // Apply filters and update URL
  const applyFilters = () => {
    updateUrl({
      search,
      status,
      priority,
      projectId,
      sortBy,
      sortDirection,
      page: '1', // Reset to page 1 when filters change
    });
    fetchTasks(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setProjectId('');
    setSortBy('createdAt');
    setSortDirection('desc');
    updateUrl({
      search: '',
      status: '',
      priority: '',
      projectId: '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      page: '1',
    });
    fetchTasks(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() });
    fetchTasks(page);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    const isCurrentSortBy = sortBy === column;
    const newDirection = isCurrentSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortDirection(newDirection);
    updateUrl({
      sortBy: column,
      sortDirection: newDirection,
    });
    fetchTasks(taskData.pagination.page);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage and track all tasks</CardDescription>
          </div>
          {(userRole === "ADMIN" || userRole === "MANAGER") && (
            <Button asChild>
              <Link href="/dashboard/tasks/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Task
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=".">All Statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={setPriority}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=".">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={applyFilters}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={resetFilters}
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('title')}>
                    Task
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('priority')}>
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Project</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Loading tasks...
                    </div>
                  </TableCell>
                </TableRow>
              ) : taskData.tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="text-sm text-muted-foreground">
                      No tasks found. Try adjusting your filters.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                taskData.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link 
                        href={`/dashboard/tasks/${task.id}`}
                        className="font-medium hover:underline"
                      >
                        {task.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1">
                        Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        <Badge 
                          variant="outline" 
                          className={cn("flex items-center", statusConfig['TODO'].color)}
                        >
                          {statusConfig['TODO'].icon}
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(priorityConfig['LOW'].color)}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {task.assignedTo.user.image && (
                              <AvatarImage src={task.assignedTo.user.image} />
                            )}
                            <AvatarFallback>
                              {getInitials(task.assignedTo.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]">
                            {task.assignedTo.user.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/dashboard/projects/${task.project.id}`}
                        className="text-sm hover:underline"
                      >
                        {task.project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/tasks/${task.id}`}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          {(userRole === "ADMIN" || userRole === "MANAGER" || 
                            (userRole === "EMPLOYEE" && task.assignedTo?.userId === task.currentUserId)) && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/tasks/edit/${task.id}`}>
                                  Edit task
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/projects/${task.project.id}`}>
                              View project
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {taskData.pagination.pages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (taskData.pagination.page > 1) {
                      handlePageChange(taskData.pagination.page - 1);
                    }
                  }}
                  className={taskData.pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: taskData.pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === taskData.pagination.pages || 
                  Math.abs(page - taskData.pagination.page) <= 1
                )
                .map((page, index, array) => {
                  // Add ellipsis if there are gaps in the sequence
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === taskData.pagination.page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (taskData.pagination.page < taskData.pagination.pages) {
                      handlePageChange(taskData.pagination.page + 1);
                    }
                  }}
                  className={taskData.pagination.page >= taskData.pagination.pages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
