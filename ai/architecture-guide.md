# Architecture Guide for Adding Components

This document provides detailed guidance on extending the Blurr HR Management Portal with new components and features, following the established patterns and best practices.

## Component Architecture

The Blurr HR Management Portal follows a clear architecture pattern that separates concerns and promotes reusability. When adding new components, follow these guidelines:

### 1. Component Types

We use several types of components with specific purposes:

#### Server Components
- Located directly in the `app/` directory or imported into page components
- Used for initial data fetching and rendering static parts of the UI
- Don't include client-side interactivity or hooks

#### Client Components
- Marked with `'use client';` at the top
- Used for interactive UI elements
- Can contain hooks, event handlers, and state
- Located in the `components/` directory

#### UI Components
- Basic building blocks from shadcn/ui
- Located in `components/ui/`
- Highly reusable across the application
- Styled consistently with Tailwind CSS

#### Feature Components
- Built for specific features (employees, projects, tasks)
- Located in their respective directories, e.g., `components/employees/`
- Combine UI components into feature-specific patterns

### 2. Component Organization

When creating new components:

1. **Component Directory**: If your feature involves multiple components, create a new directory in `components/` (e.g., `components/my-feature/`)
2. **Component Naming**: Use kebab-case for file names (e.g., `feature-list.tsx`)
3. **Component Structure**: Follow the established pattern:
   ```tsx
   'use client'; // Only for client components

   import { useState } from 'react';
   import { ComponentFromUI } from '@/components/ui/component';

   interface MyComponentProps {
     // Define clear prop interfaces
   }

   export function MyComponent({ prop1, prop2 }: MyComponentProps) {
     // Component logic here
     return (
       // JSX here
     );
   }
   ```

## Server Actions

Server Actions are a core part of the application architecture, providing a seamless way to perform server-side operations.

### 1. Creating Server Actions

1. **Action File**: Create a file in `lib/actions/` named after your feature (e.g., `my-feature-actions.ts`)
2. **Server Declaration**: Mark the file with `'use server';` at the top
3. **Error Handling**: Wrap operations in try/catch blocks for proper error handling
4. **Session Validation**: Always check session before performing operations
5. **Permission Checks**: Use the permission system to authorize actions

### 2. Action Pattern

Follow this pattern for server actions:

```typescript
'use server';

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/constants/roles";

export async function createSomething(data: CreateSomethingInput) {
  try {
    // 1. Validate session
    const session = await getCurrentSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }
    
    // 2. Check permissions
    if (!hasPermission(session.user.role, "feature", "create")) {
      throw new Error("Permission denied");
    }
    
    // 3. Perform database operation
    const result = await prisma.model.create({
      data: {
        ...data,
        // Add any additional fields
      },
    });
    
    // 4. Revalidate affected paths
    revalidatePath("/dashboard/feature");
    
    // 5. Return successful result
    return { success: true, data: result };
  } catch (error) {
    // 6. Handle errors
    console.error("Failed to create:", error);
    return { success: false, error: error.message };
  }
}
```

### 3. Implementing Optimistic Updates

For better UX, implement optimistic updates:

1. In your client component, maintain local state
2. Update the local state immediately on user action
3. Call the server action in the background
4. If the server action fails, revert the local state change

Example:

```tsx
'use client';

import { useState } from 'react';
import { createSomething } from '@/lib/actions/my-feature-actions';

export function MyFeatureForm() {
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    // Optimistic update
    const newItem = { id: 'temp-id', ...formData, status: 'pending' };
    setItems([...items, newItem]);
    
    try {
      const result = await createSomething(formData);
      
      if (!result.success) {
        // Revert optimistic update on failure
        setItems(items.filter(item => item.id !== 'temp-id'));
        // Show error
      } else {
        // Replace temp item with real item
        setItems(items.map(item => 
          item.id === 'temp-id' ? result.data : item
        ));
      }
    } catch (error) {
      // Handle error and revert optimistic update
      setItems(items.filter(item => item.id !== 'temp-id'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Component JSX
}
```

## Page Structure

When adding new pages to the application:

### 1. Page Organization

1. **Route Structure**: Create appropriate directory structures in `app/`
   - Main features belong under `app/dashboard/`
   - Auth-related pages under `app/`
   - API routes under `app/api/`

2. **File Structure**:
   - `page.tsx` - The main page component
   - `layout.tsx` - Optional layout wrapper (for sidebar, etc.)
   - `loading.tsx` - Loading state for the page
   - `error.tsx` - Error boundary for the page

### 2. Fetching Data in Pages

Use server components for initial data fetching:

```tsx
// app/dashboard/my-feature/page.tsx
import { MyFeatureList } from '@/components/my-feature/feature-list';
import { getFeatureItems } from '@/lib/actions/my-feature-actions';

export default async function MyFeaturePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search?.toString() || '';
  
  const { items, pagination } = await getFeatureItems({
    page,
    search,
  });
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">My Feature</h1>
      <MyFeatureList 
        initialItems={items} 
        pagination={pagination} 
      />
    </div>
  );
}
```

### 3. Server-Side Search and Filtering

When implementing search and filters:

1. Use search params for shareable URLs
2. Implement server-side filtering and pagination
3. Use client components for the UI elements
4. Update the URL with client-side navigation

## Data Modeling

When extending the database schema:

### 1. Schema Updates

1. Edit `prisma/schema.prisma` to add new models or fields
2. Run `npx prisma migrate dev --name description_of_change` to create a migration
3. Run `npx prisma generate` to update the Prisma client

### 2. Relationship Best Practices

Follow these patterns for relationships:

- **One-to-Many**: Use arrays on the "one" side and a reference field on the "many" side
- **Many-to-Many**: Use arrays on both sides with a join table
- **One-to-One**: Use a unique reference field on one side

### 3. Example Schema Addition

```prisma
model NewFeature {
  id          String    @id @default(cuid())
  name        String
  description String?
  status      NewFeatureStatus @default(DRAFT)
  employeeId  String?
  employee    Employee? @relation(fields: [employeeId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum NewFeatureStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

## Authentication and Authorization

The application uses NextAuth.js with a role-based permission system:

### 1. User Roles

- **ADMIN**: Full access to all features
- **MANAGER**: Access to projects, limited employee data
- **EMPLOYEE**: Access to assigned tasks and personal information

### 2. Permission Checks

Always use the permission system in server actions:

```typescript
if (!hasPermission(session.user.role, "feature", "action")) {
  throw new Error("Permission denied");
}
```

### 3. UI Permission Checks

In client components, conditionally render UI elements based on user permissions:

```tsx
'use client';

import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/constants/roles";

export function MyFeatureControls() {
  const { data: session } = useSession();
  const canCreate = session?.user && hasPermission(session.user.role, "feature", "create");
  
  return (
    <div>
      {canCreate && (
        <Button>Create New</Button>
      )}
    </div>
  );
}
```

## Documentation

When implementing new features:

1. **AI Prompt Logs**: Create a markdown file in the `ai/` directory
2. **Component Documentation**: Add JSDoc comments to components:
   ```tsx
   /**
    * MyComponent - Description of what this component does
    * 
    * @param prop1 Description of prop1
    * @param prop2 Description of prop2
    */
   export function MyComponent({ prop1, prop2 }: MyComponentProps) {
     // ...
   }
   ```
3. **README Updates**: Update the README.md with significant new features

## Testing

When adding new components, consider adding tests:

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user flows

## Styling Guidelines

The application uses Tailwind CSS with shadcn/ui components:

1. **Component Consistency**: Maintain consistent spacing, colors, and typography
2. **Responsive Design**: Ensure components work on all screen sizes
3. **Dark Mode Support**: Test components in both light and dark modes
4. **Accessibility**: Ensure components meet accessibility standards

## Conclusion

By following these architecture guidelines, you'll ensure that new components and features integrate seamlessly with the existing application while maintaining code quality and consistency.

For specific implementation examples, refer to the existing components in the codebase, which demonstrate these patterns in practice.
