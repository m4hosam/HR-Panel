'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/constants/roles";

/**
 * Get all users
 */
export async function getUsers({
  page = 1,
  limit = 50,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const skip = (page - 1) * limit;

    // Build search filter
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    return {
      users,
      pagination: {
        total,
        pageCount: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to fetch users",
      users: [],
      pagination: {
        total: 0,
        pageCount: 1,
        currentPage: page,
      },
    };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: Role) {
  try {
    // Update the user role
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Revalidate paths that might display user information
    revalidatePath('/admin/users');
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: error instanceof Error ? error.message : "Failed to update user role" };
  }
}
