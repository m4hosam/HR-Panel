'use server';

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, ROLES } from "@/lib/constants/roles";
import { redirect } from "next/navigation";

/**
 * Get all employees with optional filtering and pagination
 */
export async function getEmployees({
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
}) {
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
    const employeesAll = await prisma.employee.findMany({});
    console.log("employeesAll", employeesAll);    const employees = await prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy === "name" 
        ? { user: { name: sortDirection } } 
        : { [sortBy]: sortDirection },
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
    console.error("Error getting employees:", error);
    return { error: error instanceof Error ? error.message : "Failed to get employees" };
  }
}

/**
 * Get an employee by ID
 */
export async function getEmployeeById(id: string) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view employee details");
    }
    
    // Check if user has permission to read employees
    if (!hasPermission(session.user.role, "employees", "read")) {
      throw new Error("You don't have permission to view employee details");
    }
    
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        salaries: {
          orderBy: [
            { year: "desc" },
            { month: "desc" },
          ],
          take: 12, // Get the last 12 salary records
        },
      },
    });
    
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    // If the user is an employee (not admin/manager), only allow viewing their own details
    if (
      session.user.role === ROLES.EMPLOYEE &&
      employee.userId !== session.user.id
    ) {
      throw new Error("You can only view your own employee details");
    }
    
    return { employee };
  } catch (error) {
    console.error("Error getting employee:", error);
    return { error: error instanceof Error ? error.message : "Failed to get employee details" };
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(formData: FormData) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to create employees
    if (!hasPermission(session.user.role, "employees", "create")) {
      throw new Error("You don't have permission to create employees");
    }

    const userId = formData.get("userId") as string;
    const position = formData.get("position") as string;
    const department = formData.get("department") as string;
    const joinDateStr = formData.get("joinDate") as string;
    const baseSalary = parseFloat(formData.get("baseSalary") as string);
    
    // Validate data
    if (!userId || !position || !department || !joinDateStr || isNaN(baseSalary)) {
      throw new Error("All fields are required");
    }
    
    const joinDate = new Date(joinDateStr);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if employee record already exists for this user
    const existingEmployee = await prisma.employee.findUnique({
      where: { userId },
    });
    
    if (existingEmployee) {
      throw new Error("Employee record already exists for this user");
    }
    
    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        userId,
        position,
        department,
        joinDate,
      },
    });
    
    // Create initial salary record
    const now = new Date();
    await prisma.salary.create({
      data: {
        employeeId: employee.id,
        month: now.getMonth() + 1, // JavaScript months are 0-based
        year: now.getFullYear(),
        baseSalary,
        bonus: 0,
        deductions: 0,
        totalSalary: baseSalary,
      },
    });
    
    revalidatePath("/dashboard/employees");
    return { success: true, employeeId: employee.id };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { error: error instanceof Error ? error.message : "Failed to create employee" };
  }
}

/**
 * Update an employee
 */
export async function updateEmployee(formData: FormData) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to update employees
    if (!hasPermission(session.user.role, "employees", "update")) {
      throw new Error("You don't have permission to update employees");
    }

    const id = formData.get("id") as string;
    const position = formData.get("position") as string;
    const department = formData.get("department") as string;
    
    // Validate data
    if (!id || !position || !department) {
      throw new Error("All fields are required");
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
    });
    
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    // If the user is an employee (not admin/manager), only allow updating their own details
    if (
      session.user.role === ROLES.EMPLOYEE &&
      employee.userId !== session.user.id
    ) {
      throw new Error("You can only update your own employee details");
    }
    
    // Update employee record
    await prisma.employee.update({
      where: { id },
      data: {
        position,
        department,
      },
    });
    
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { error: error instanceof Error ? error.message : "Failed to update employee" };
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to delete employees
    if (!hasPermission(session.user.role, "employees", "delete")) {
      throw new Error("You don't have permission to delete employees");
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
    });
    
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    // Delete employee record
    await prisma.employee.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/employees");
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete employee" };
  }
}
