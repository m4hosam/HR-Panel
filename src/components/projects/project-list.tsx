"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, Plus } from "lucide-react";

interface ProjectListProps {
  initialProjects: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    status: ProjectStatus;
    totalTasks: number;
    completedTasks: number;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  canCreate: boolean;
}

export function ProjectList({ initialProjects, pagination, canCreate }: ProjectListProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    router.push(`/dashboard/projects?${params.toString()}`);
  };

  // Handle reset filters
  const handleReset = () => {
    setSearch("");
    setStatus("");
    router.push("/dashboard/projects");
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Directory</CardTitle>
            <CardDescription>Manage your organization's projects</CardDescription>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <form onSubmit={handleSearch} className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Filter</Button>
          <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
        </form>

        {/* Projects Table */}
        {projects.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium hover:underline"
                      >
                        {project.name}
                      </Link>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(project.status)}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(project.startDate.toString())}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.completedTasks}/{project.totalTasks}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">No projects found</p>
            {canCreate && (
              <Button asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create a project
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Pagination */}
      {projects.length > 0 && pagination.pages > 1 && (
        <CardFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={pagination.page > 1 ? 
                    `/dashboard/projects?page=${pagination.page - 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}` : 
                    "#"
                  } 
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({length: pagination.pages}, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    href={`/dashboard/projects?page=${page}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}`} 
                    isActive={page === pagination.page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href={pagination.page < pagination.pages ? 
                    `/dashboard/projects?page=${pagination.page + 1}${search ? `&search=${search}` : ""}${status ? `&status=${status}` : ""}` : 
                    "#"
                  } 
                  className={pagination.page === pagination.pages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}
