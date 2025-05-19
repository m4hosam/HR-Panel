'use server';

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/constants/roles";
import { redirect } from "next/navigation";

/**
 * Get all tasks with optional filtering and pagination
 */
export async function getTasks({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  priority = "",
  projectId = "",
  assignedToId = "",
  sortBy = "createdAt",
  sortDirection = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  projectId?: string;
  assignedToId?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view tasks");
    }
    
    // Check if user has permission to read tasks
    if (!hasPermission(session.user.role, "tasks", "read")) {
      throw new Error("You don't have permission to view tasks");
    }
    
    const skip = (page - 1) * limit;
    
    // Build the where clause for search and filter
    const where = {
      ...(search ? {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(projectId ? { projectId } : {}),
      ...(assignedToId ? { assignedToId } : {}),
    };
    
    const tasks = await prisma.task.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortDirection,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    
    const totalTasks = await prisma.task.count();
    
    return {
      tasks,
      pagination: {
        total: totalTasks,
        pages: Math.ceil(totalTasks / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting tasks:", error);
    return { error: error instanceof Error ? error.message : "Failed to get tasks" };
  }
}

/**
 * Get a task by ID
 */
export async function getTaskById(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view task details");
    }
    
    // Check if user has permission to read tasks
    if (!hasPermission(session.user.role, "tasks", "read")) {
      throw new Error("You don't have permission to view task details");
    }
    
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    
    if (!task) {
      throw new Error("Task not found");
    }
    
    return { task };
  } catch (error) {
    console.error("Error getting task:", error);
    return { error: error instanceof Error ? error.message : "Failed to get task details" };
  }
}

/**
 * Create a new task
 */
export async function createTask(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to create tasks
    if (!hasPermission(session.user.role, "tasks", "create")) {
      throw new Error("You don't have permission to create tasks");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectId = formData.get("projectId") as string;
    const priority = formData.get("priority") as string;
    const status = formData.get("status") as string;
    const assignedToId = formData.get("assignedToId") as string || null;
    
    // Validate data
    if (!title || !projectId || !status || !priority) {
      throw new Error("Title, project, status, and priority are required");
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        priority: priority as any,
        status: status as any,
        assignedToId: assignedToId || undefined,
      },
    });
    
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/tasks");
    return { success: true, taskId: task.id };
  } catch (error) {
    console.error("Error creating task:", error);
    return { error: error instanceof Error ? error.message : "Failed to create task" };
  }
}

/**
 * Update a task
 */
export async function updateTask(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to update tasks
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER";
    const canUpdateTask = hasPermission(session.user.role, "tasks", "update");
    
    if (!canUpdateTask) {
      throw new Error("You don't have permission to update tasks");
    }

    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectId = formData.get("projectId") as string;
    const priority = formData.get("priority") as string;
    const status = formData.get("status") as string;
    const assignedToId = formData.get("assignedToId") as string || null;
    
    // Validate data
    if (!id || !title || !projectId || !status || !priority) {
      throw new Error("Task ID, title, project, status, and priority are required");
    }
    
    // Check if task exists and get current data
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!existingTask) {
      throw new Error("Task not found");
    }
    
    // For employee role, only allow updating status (and only their own tasks)
    if (session.user.role === "EMPLOYEE") {
      // Get the employee record for this user
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!employee) {
        throw new Error("Employee record not found");
      }
      
      // Employees can only update tasks assigned to them
      if (existingTask.assignedToId !== employee.id) {
        throw new Error("You can only update tasks assigned to you");
      }
      
      // Employees can only update task status
      await prisma.task.update({
        where: { id },
        data: {
          status: status as any,
        },
      });
    } else {
      // Admin/Manager can update all fields
      await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          projectId,
          priority: priority as any,
          status: status as any,
          assignedToId: assignedToId || null,
        },
      });
    }
    
    revalidatePath(`/dashboard/tasks/${id}`);
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { error: error instanceof Error ? error.message : "Failed to update task" };
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to delete tasks
    if (!hasPermission(session.user.role, "tasks", "delete")) {
      throw new Error("You don't have permission to delete tasks");
    }
    
    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });
    
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Delete task
    await prisma.task.delete({
      where: { id },
    });
    
    revalidatePath(`/dashboard/projects/${task.projectId}`);
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete task" };
  }
}

/**
 * Get all employees for task assignment
 */
export async function getEmployeesForAssignment() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view employees");
    }
    
    // Check if user has permission to read employees
    if (!hasPermission(session.user.role, "employees", "read")) {
      throw new Error("You don't have permission to view employees");
    }
    
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
    
    return { employees };
  } catch (error) {
    console.error("Error getting employees:", error);
    return { error: error instanceof Error ? error.message : "Failed to get employees" };
  }
}
