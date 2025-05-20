# Blurr HR Management Portal

This is a comprehensive HR management portal built with Next.js 14, designed to handle employee management, project tracking, and task organization for Blurr.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js App Router with Server Actions
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with role-based access control

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blurr-hr-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Features

### Authentication & Authorization

- **User Authentication**: Login and registration with email/password
- **Role-based Access Control**: Three user roles (Admin, Manager, Employee) with different permissions
- **Protected Routes**: Routes are protected based on user roles via middleware

### Employee Management

- **Employee Directory**: List all employees with search, filter, and pagination
- **Employee Profiles**: View and edit detailed employee information
- **Salary Management**: Track employee salaries with bonus and deduction calculations
- **Historical Salary Data**: View salary history for each employee

### Project Management

- **Project Tracking**: Create and manage projects with descriptions, dates, and status
- **Project Dashboard**: Overview of all projects with filtering by status
- **Project Timeline**: Track project progress from planning to completion

### Project Architecture

The application follows a modern Next.js 14 architecture using the App Router:

### Folder Structure

```
blurr-hr-portal/
├── .env.local                # Environment variables
├── prisma/                   # Database configuration
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard and feature pages
│   │   ├── login/            # Authentication pages
│   │   └── register/         # Registration pages
│   ├── components/           # UI components
│   │   ├── ui/               # Base UI components (shadcn)
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── employees/        # Employee-related components
│   │   ├── projects/         # Project-related components
│   │   └── tasks/            # Task-related components
│   ├── lib/                  # Utility functions
│   │   ├── actions/          # Server Actions
│   │   ├── constants/        # Application constants
│   │   └── utils.ts          # Helper functions
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript type definitions
└── ai/                       # AI prompt logs and architecture docs
```

## Database Schema

The database includes the following models:

- **User**: Authentication and user information with role-based access control
- **Employee**: Employee details linked to a User
- **Project**: Project information and status
- **Task**: Tasks assigned to employees within projects
- **Salary**: Monthly salary records for employees

## Adding New Components

When adding new components or features to the HR portal, follow these architectural patterns:

### 1. Component Structure

New components should be organized in the appropriate directory:

- **UI Components**: Place reusable UI components in `src/components/ui/`
- **Feature Components**: Place feature-specific components in their respective directories (e.g., `src/components/employees/`)

### 2. Server Actions

For backend functionality:

1. Create a new server action file in `src/lib/actions/` (e.g., `my-feature-actions.ts`)
2. Mark the file with `'use server';` at the top
3. Implement data access using Prisma
4. Include permission checks using the role-based access system
5. Use revalidation where needed (`revalidatePath`)

Example server action structure:

```typescript
'use server';

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/constants/roles";

export async function myNewAction(data) {
  try {
    const session = await getCurrentSession();
    
    if (!session?.user) {
      throw new Error("Authentication required");
    }
    
    // Check permissions
    if (!hasPermission(session.user.role, "feature", "action")) {
      throw new Error("Permission denied");
    }
    
    // Perform database operations
    const result = await prisma.model.action({
      // ...operation details
    });
    
    // Revalidate paths as needed
    revalidatePath("/affected/path");
    
    return result;
  } catch (error) {
    console.error("Action failed:", error);
    throw new Error(error.message);
  }
}
```

### 3. Page Structure

When adding new pages:

1. Create a new directory in `src/app/` for the feature (e.g., `src/app/dashboard/my-feature/`)
2. Create `page.tsx` for the main page content
3. Optionally add `layout.tsx` for feature-specific layouts
4. Use client components (`'use client';`) for interactive UI elements

### 4. Data Flow

Follow these patterns for data flow:

1. **Server Components**: Use server components for initial data fetching
2. **Server Actions**: Use server actions for data mutations
3. **Client Components**: Use client components for interactivity
4. **Optimistic Updates**: Implement optimistic UI updates for better UX

### 5. Documentation

Document your new feature:

1. Create an AI prompt log in `ai/my-feature.md`
2. Include requirements, implementation details, and architectural decisions
3. Update this README if your feature adds significant functionality

## Best Practices

- **Component Reuse**: Create reusable components with clear props interfaces
- **Type Safety**: Use TypeScript for better type checking and code quality
- **Error Handling**: Implement proper error handling in both UI and server actions
- **Responsive Design**: Ensure all UI components work well on mobile devices
- **Loading States**: Show loading states during data fetching operations
- **Permissions**: Always check user permissions before performing actions

## Documentation

For more detailed information on specific features, refer to the documentation files in the `ai/` directory:

- `authentication.md`: Authentication implementation details
- `employee-management.md`: Employee management features
- `schema-design.md`: Database schema design decisions
- `claudeStructure.md`: Overall project architecture

## License

This project is licensed under the terms of the license included in the repository.
