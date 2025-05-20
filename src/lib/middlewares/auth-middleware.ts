import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/auth";
import { ROLES } from "@/lib/constants/roles";

/**
 * Middleware to protect routes based on user roles
 * 
 * @param request The incoming request
 * @param allowedRoles Array of roles allowed to access the route
 * @returns NextResponse object
 */
export async function roleMiddleware(
  request: NextRequest,
  allowedRoles: string[] = [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE],
) {
  const session = await getCurrentSession();

  // No session - redirect to login
  if (!session || !session.user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user role is allowed
  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) {
    // User doesn't have permission - redirect to dashboard or access denied
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // User has permission - allow request to proceed
  return NextResponse.next();
}
