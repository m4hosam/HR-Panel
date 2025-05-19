'use server';

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, ROLES } from "@/lib/constants/roles";
import { redirect } from "next/navigation";

/**
 * Get salary records for an employee
 */
export async function getEmployeeSalaries({
  employeeId,
  year,
  limit = 12,
}: {
  employeeId: string;
  year?: number;
  limit?: number;
}) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      throw new Error("You must be signed in to view salary information");
    }
    
    // Check if user has permission to read salaries
    if (!hasPermission(session.user.role, "salaries", "read")) {
      throw new Error("You don't have permission to view salary information");
    }
    
    // Get the employee to check permissions
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    // If the user is an employee (not admin/manager), only allow viewing their own salary
    if (
      session.user.role === ROLES.EMPLOYEE &&
      employee.userId !== session.user.id
    ) {
      throw new Error("You can only view your own salary information");
    }
    
    // Build the where clause
    const where = {
      employeeId,
      ...(year ? { year } : {}),
    };
    
    // Get salary records
    const salaries = await prisma.salary.findMany({
      where,
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
      take: limit,
    });
    
    // Get years for filtering
    const availableYears = await prisma.salary.groupBy({
      by: ["year"],
      where: { employeeId },
      orderBy: {
        year: "desc",
      },
      _count: {
        year: true,
      },
    });
    
    return {
      salaries,
      years: availableYears.map((y) => y.year),
    };
  } catch (error) {
    console.error("Error getting salary records:", error);
    return { error: error instanceof Error ? error.message : "Failed to get salary records" };
  }
}

/**
 * Create or update a salary record
 */
export async function saveSalaryRecord(formData: FormData) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Check if user has permission to update salaries
    if (!hasPermission(session.user.role, "salaries", "update")) {
      throw new Error("You don't have permission to update salary information");
    }

    const employeeId = formData.get("employeeId") as string;
    const month = parseInt(formData.get("month") as string, 10);
    const year = parseInt(formData.get("year") as string, 10);
    const baseSalary = parseFloat(formData.get("baseSalary") as string);
    const bonus = parseFloat(formData.get("bonus") as string || "0");
    const deductions = parseFloat(formData.get("deductions") as string || "0");
    
    // Validate data
    if (!employeeId || isNaN(month) || isNaN(year) || isNaN(baseSalary)) {
      throw new Error("All required fields must be valid");
    }
    
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }
    
    if (year < 2000 || year > 2100) {
      throw new Error("Year is out of valid range");
    }
    
    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!employee) {
      throw new Error("Employee not found");
    }
    
    // Calculate total salary
    const totalSalary = baseSalary + bonus - deductions;
    
    // Check if salary record already exists for this month/year
    const existingSalary = await prisma.salary.findUnique({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year,
        },
      },
    });
    
    // Create or update salary record
    if (existingSalary) {
      await prisma.salary.update({
        where: { id: existingSalary.id },
        data: {
          baseSalary,
          bonus,
          deductions,
          totalSalary,
        },
      });
    } else {
      await prisma.salary.create({
        data: {
          employeeId,
          month,
          year,
          baseSalary,
          bonus,
          deductions,
          totalSalary,
        },
      });
    }
    
    revalidatePath(`/dashboard/employees/${employeeId}`);
    revalidatePath(`/dashboard/employees/salary`);
    return { success: true };
  } catch (error) {
    console.error("Error saving salary record:", error);
    return { error: error instanceof Error ? error.message : "Failed to save salary record" };
  }
}

/**
 * Delete a salary record
 */
export async function deleteSalaryRecord(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      redirect("/login");
    }
    
    // Only admins can delete salary records
    if (session.user.role !== ROLES.ADMIN) {
      throw new Error("Only administrators can delete salary records");
    }
    
    // Check if salary record exists
    const salary = await prisma.salary.findUnique({
      where: { id },
      include: { employee: true },
    });
    
    if (!salary) {
      throw new Error("Salary record not found");
    }
    
    // Delete salary record
    await prisma.salary.delete({
      where: { id },
    });
    
    revalidatePath(`/dashboard/employees/${salary.employeeId}`);
    revalidatePath(`/dashboard/employees/salary`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting salary record:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete salary record" };
  }
}
