"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/auth";
import { hasPermission } from "@/lib/constants/roles";
interface Employee {
  id: string;
  joinDate: Date;
  position: string;
  department: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

/**
 * Search employees with filtering and pagination
 */
export async function searchEmployees({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "name",
  sortDirection = "asc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}): Promise<{
  employees?: Employee[];
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      throw new Error("You must be signed in to view employees");
    }

    // Check if user has permission to read employees
    if (!hasPermission(session.user.role, "employees", "read")) {
      throw new Error("You don't have permission to view employees");
    }

    const skip = (page - 1) * limit;

    // Build the where clause for search
    const where = search
      ? {
          OR: [
            { user: { name: { contains: search } } },
            { position: { contains: search } },
            { department: { contains: search } },
          ],
        }
      : {};

    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy === "name" ? { user: { name: sortDirection } } : { [sortBy]: sortDirection },
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
    });

    const totalEmployees = await prisma.employee.count({ where });

    return {
      employees,
      pagination: {
        total: totalEmployees,
        pages: Math.ceil(totalEmployees / limit),
        page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error searching employees:", error);
    return { error: error instanceof Error ? error.message : "Failed to search employees" };
  }
}
