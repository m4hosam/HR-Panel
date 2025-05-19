'use server';

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/constants/roles";
import { redirect } from "next/navigation";

/**
 * Get all projects with optional filtering and pagination
 */
export async function getProjects({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortBy = "name",
  sortDirection = "asc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view projects");
    }
    
    // Check if user has permission to read projects
    if (!hasPermission(session.user.role, "projects", "read")) {
      throw new Error("You don't have permission to view projects");
    }
    
    const skip = (page - 1) * limit;
    
    // Build the where clause for search and filter
    const where = {
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
      ...(status ? { status } : {}),
    };
    
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortDirection,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          take: 0,
          where: {
            status: 'DONE',
          },
          select: {
            id: true,
          },
        },
      },
    });
    
    // Calculate progress for each project
    const projectsWithProgress = projects.map(project => {
      const totalTasks = project._count.tasks;
      const completedTasks = project.tasks.length;
      const progress = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      // Remove the tasks array and _count, add progress
      const { tasks, _count, ...rest } = project;
      return {
        ...rest,
        totalTasks,
        completedTasks,
        progress,
      };
    });
    
    const totalProjects = await prisma.project.count({ where });
    
    return {
      projects: projectsWithProgress,
      pagination: {
        total: totalProjects,
        pages: Math.ceil(totalProjects / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error getting projects:", error);
    return { error: error instanceof Error ? error.message : "Failed to get projects" };
  }
}

/**
 * Get a project by ID with its tasks
 */
export async function getProjectById(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view project details");
    }
    
    // Check if user has permission to read projects
    if (!hasPermission(session.user.role, "projects", "read")) {
      throw new Error("You don't have permission to view project details");
    }
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
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
        },
      },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Calculate project progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'DONE').length;
    const progress = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    return { 
      project: {
        ...project,
        totalTasks,
        completedTasks,
        progress,
      }
    };
  } catch (error) {
    console.error("Error getting project:", error);
    return { error: error instanceof Error ? error.message : "Failed to get project details" };
  }
}

/**
 * Create a new project
 */
export async function createProject(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to create projects
    if (!hasPermission(session.user.role, "projects", "create")) {
      throw new Error("You don't have permission to create projects");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    
    // Validate data
    if (!name || !status || !startDateStr) {
      throw new Error("Name, status, and start date are required");
    }
    
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;
    
    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status as any,
        startDate,
        endDate,
      },
    });
    
    revalidatePath("/dashboard/projects");
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: error instanceof Error ? error.message : "Failed to create project" };
  }
}

/**
 * Update a project
 */
export async function updateProject(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to update projects
    if (!hasPermission(session.user.role, "projects", "update")) {
      throw new Error("You don't have permission to update projects");
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    
    // Validate data
    if (!id || !name || !status || !startDateStr) {
      throw new Error("Project ID, name, status, and start date are required");
    }
    
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : null;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!existingProject) {
      throw new Error("Project not found");
    }
    
    // Update project
    await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status: status as any,
        startDate,
        endDate,
      },
    });
    
    revalidatePath(`/dashboard/projects/${id}`);
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: error instanceof Error ? error.message : "Failed to update project" };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to delete projects
    if (!hasPermission(session.user.role, "projects", "delete")) {
      throw new Error("You don't have permission to delete projects");
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Delete project and all associated tasks
    await prisma.project.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete project" };
  }
}
