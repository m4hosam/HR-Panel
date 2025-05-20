import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string or Date object to a readable format
 * @param date Date string or Date object to format
 * @param formatStr Format string (default: "PP")
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, formatStr = "PP") {
  try {
    const dateObj = typeof date === 'string' 
      ? parseISO(date)
      : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Format a currency value
 * @param value Numeric value to format as currency
 * @param currency Currency code (default: "USD")
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Filter out already assigned users for employee creation
 * @param users All users
 * @param employeeUserIds Array of user IDs that already have employee records
 * @returns Array of users who don't have employee records yet
 */
export function filterAvailableUsers(
  users: Array<{ id: string; name: string | null; email: string | null }>,
  employeeUserIds: string[]
) {
  return users.filter(user => !employeeUserIds.includes(user.id));
}
