import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTaskById } from "@/lib/actions/task-actions";
import { TaskDetail } from "@/components/tasks/task-detail";

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
    title: `${task.title} | Tasks | Blurr HR Management`,
    description: `Details for task: ${task.title}`,
  };
}

export default async function TaskDetailPage({
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

  return (
    <div className="container py-6">
      <TaskDetail 
        task={task} 
        userRole={session.user.role} 
        userId={session.user.id}
      />
    </div>
  );
}
