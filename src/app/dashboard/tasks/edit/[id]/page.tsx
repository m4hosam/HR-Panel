import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTaskById } from "@/lib/actions/task-actions";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/tasks/task-form";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // Get task details to create dynamic metadata
  const { task, error } = await getTaskById(params.id);

  if (error || !task) {
    return {
      title: "Task Not Found | Blurr HR Management",
    };
  }

  return {
    title: `Edit ${task.title} | Blurr HR Management`,
    description: `Edit task: ${task.title}`,
  };
}

export default async function EditTaskPage({
  params,
}: {
  params: { id: string };
}) {
  // Get user session
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch the task by ID
  const { task, error } = await getTaskById(params.id);

  // If task not found, show 404
  if (error || !task) {
    notFound();
  }

  // For employee role, check if they are assigned to this task
  if (session.user.role === "EMPLOYEE") {
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee || task.assignedToId !== employee.id) {
      // Employees can only edit tasks assigned to them
      redirect("/dashboard/tasks");
    }
  }

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
    <div className="container max-w-4xl py-6 space-y-6">
      <h1 className="text-3xl font-bold">Edit Task</h1>
      
      <TaskForm 
        task={task} 
        projects={projects}
        userRole={session.user.role}
      />
    </div>
  );
}
