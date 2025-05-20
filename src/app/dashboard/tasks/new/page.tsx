import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/auth";
import { hasPermission } from "@/lib/constants/roles";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/tasks/task-form";

export const metadata: Metadata = {
  title: "New Task | Blurr HR Management",
  description: "Create a new task in the Blurr HR Management portal",
};

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams?: {
    projectId?: string;
  };
}) {
  // Get user session
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has permission to create tasks
  if (!hasPermission(session.user.role, "tasks", "create")) {
    redirect("/dashboard");
  }

  // Get optional projectId from query params
  const projectId = searchParams?.projectId;

  // Fetch all projects for the project dropdown
  const projects = await prisma.project.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="container max-w-4xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create New Task</h1>
      <TaskForm 
        projects={projects} 
        defaultProjectId={projectId || ""} 
        userRole={session.user.role}
      />
    </div>
  );
}
