"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { hash } from "bcrypt";

// Schema for user registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterData = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterData): Promise<{ success?: boolean; error?: string }> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (existingUser) {
      return { error: "Email already in use" };
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create the user
    await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER', // Default role
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    
    return { error: "An error occurred during registration" };
  }
}

export async function login(email: string, password: string) {
  // Authentication is handled by NextAuth.js in the authorize callback
  // This is a placeholder for any additional login logic
  return { success: true };
}