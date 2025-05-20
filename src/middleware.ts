import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { ROLES } from "./lib/constants/roles";

// Role-based middleware
export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const path = req.nextUrl.pathname;

    // if (path.startsWith("/dashboard/admin") && token?.role !== ROLES.ADMIN) {
    //   return NextResponse.redirect(new URL("/dashboard", req.url));
    // }

    // if (
    //   path.startsWith("/dashboard/projects/new") &&
    //   token?.role !== ROLES.ADMIN &&
    //   token?.role !== ROLES.MANAGER
    // ) {
    //   return NextResponse.redirect(new URL("/dashboard/projects", req.url));
    // }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Match only dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
