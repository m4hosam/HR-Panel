import { Metadata } from "next";
import { getCurrentSession } from "@/auth";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/tasks/task-list";
import { getTasks } from "@/lib/actions/task-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { hasPermission } from "@/lib/constants/roles";

export const metadata: Metadata = {
  title: "Tasks | Blurr HR Management",
  description: "Manage and track all tasks in the Blurr HR Management portal.",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: { 
    page?: string;
    search?: string;
    status?: string;
    priority?: string;
    projectId?: string;
    sortBy?: string;
    sortDirection?: string;
    view?: string;
  };
}) {
  // Get current user session
  const session = await getCurrentSession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Get pagination and filter params from URL
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";
  const status = searchParams?.status || "";
  const priority = searchParams?.priority || "";
  const projectId = searchParams?.projectId || "";
  const sortBy = searchParams?.sortBy || "createdAt";
  const sortDirection = searchParams?.sortDirection === "asc" ? "asc" : "desc";
  const view = searchParams?.view || "list";
  
  // Fetch tasks for current page and filters
  const { tasks, pagination, error } = await getTasks({
    page,
    limit: 10,
    search,
    status,
    priority, 
    projectId,
    sortBy,
    sortDirection: sortDirection as "asc" | "desc",
  });
  
  return (
    <div className="container space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>
      <Tabs defaultValue={view} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="list" asChild>
              <a href={`/dashboard/tasks?view=list`}>List View</a>
            </TabsTrigger>
            <TabsTrigger value="kanban" asChild>
              <a href={`/dashboard/tasks?view=kanban`}>Kanban Board</a>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="list" className="w-full">
          <TaskList 
            initialTasks={tasks || []} 
            totalTasks={pagination?.total || 0}
            currentPage={pagination?.page || 1}
            totalPages={pagination?.pages || 1}
            userRole={session.user.role}
          />
        </TabsContent>
        
        <TabsContent value="kanban">
          <KanbanBoard 
            tasks={tasks || []} 
            userRole={session.user.role}
          />
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}
    </div>
  );
}
