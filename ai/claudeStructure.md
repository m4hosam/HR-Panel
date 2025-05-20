# HR Management Portal - Project Architecture & Planning

I'll help you create a robust architecture for the Blurr HR Management Portal based on Next.js 14 best practices with the App Router.

## 1. Folder Structure

```
blurr-hr-portal/
├── .env.local                # Environment variables
├── .gitignore
├── ai/                       # AI prompt logs directory
│   ├── architecture.md       # This planning document
│   └── ...                   # Additional prompt logs for each feature
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth.js routes
│   │   └── ai/               # AI chatbot API routes
│   ├── (auth)/               # Auth routes (grouped layout)
│   │   ├── login/            # Login page
│   │   └── signup/           # Signup page
│   ├── dashboard/            # Dashboard (protected)
│   │   ├── employees/        # Employees section
│   │   │   ├── [id]/         # Single employee page
│   │   │   └── ...
│   │   ├── projects/         # Projects section
│   │   │   ├── [id]/         # Single project page
│   │   │   └── ...
│   │   └── ...
│   ├── error.tsx             # Error boundary component
│   ├── layout.tsx            # Root layout
│   ├── loading.tsx           # Loading state
│   └── page.tsx              # Home page
├── components/               # Reusable components
│   ├── ui/                   # UI components (shadcn)
│   ├── auth/                 # Auth components
│   ├── dashboard/            # Dashboard components
│   ├── employees/            # Employee-related components
│   ├── projects/             # Project-related components
│   ├── tasks/                # Task-related components
│   └── shared/               # Shared components
├── lib/                      # Utility functions and libraries
│   ├── actions/              # Server actions
│   ├── auth.ts               # Auth configuration
│   ├── db.ts                 # Database client
│   ├── utils.ts              # Utility functions
│   └── types.ts              # TypeScript types
├── prisma/                   # Prisma configuration
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── public/                   # Static assets
├── styles/                   # Global styles
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 2. Technical Milestones

### Milestone 1: Project Setup & Authentication
- **Description**: Initialize project, set up database schema, and implement authentication
- **Tasks**:
  - Initialize Next.js project with TypeScript
  - Configure Tailwind CSS and shadcn/ui
  - Set up Prisma with SQLite
  - Design database schema
  - Implement NextAuth.js for authentication
  - Create login/signup pages
  - Implement protected routes and middleware
- **Files**:
  - `prisma/schema.prisma` (database schema)
  - `lib/auth.ts` (auth configuration)
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/signup/page.tsx`
  - `components/auth/LoginForm.tsx`
  - `components/auth/SignupForm.tsx`
  - `middleware.ts` (route protection)

### Milestone 2: Dashboard & Layout
- **Description**: Create the main dashboard layout and navigation
- **Tasks**:
  - Implement dashboard layout with sidebar
  - Create navigation component
  - Build dashboard overview page
  - Implement responsive design
- **Files**:
  - `app/dashboard/layout.tsx`
  - `app/dashboard/page.tsx`
  - `components/dashboard/Sidebar.tsx`
  - `components/dashboard/Navbar.tsx`
  - `components/dashboard/Overview.tsx`

### Milestone 3: Employees Management
- **Description**: Implement employee management functionality
- **Tasks**:
  - Create employee list view
  - Implement add/edit employee forms
  - Build employee detail view
  - Create salary table with month picker
  - Implement bonus and deductions functionality
- **Files**:
  - `app/dashboard/employees/page.tsx`
  - `app/dashboard/employees/[id]/page.tsx`
  - `app/dashboard/employees/new/page.tsx`
  - `components/employees/EmployeeList.tsx`
  - `components/employees/EmployeeForm.tsx`
  - `components/employees/SalaryTable.tsx`
  - `lib/actions/employees.ts` (server actions)

### Milestone 4: Projects Management
- **Description**: Build project management functionality
- **Tasks**:
  - Create projects list view
  - Implement add/edit project forms
  - Build project detail view
  - Implement project filtering and sorting
- **Files**:
  - `app/dashboard/projects/page.tsx`
  - `app/dashboard/projects/[id]/page.tsx`
  - `app/dashboard/projects/new/page.tsx`
  - `components/projects/ProjectList.tsx`
  - `components/projects/ProjectForm.tsx`
  - `components/projects/ProjectDetails.tsx`
  - `lib/actions/projects.ts` (server actions)

### Milestone 5: Tasks Management
- **Description**: Implement task management with Kanban and list views
- **Tasks**:
  - Create task forms and CRUD operations
  - Build Kanban board view for tasks
  - Implement backlog table view
  - Add task assignment functionality
  - Create task filtering and sorting
- **Files**:
  - `app/dashboard/projects/[id]/tasks/page.tsx`
  - `components/tasks/TaskForm.tsx`
  - `components/tasks/KanbanBoard.tsx`
  - `components/tasks/BacklogTable.tsx`
  - `components/tasks/TaskItem.tsx`
  - `lib/actions/tasks.ts` (server actions)

### Milestone 6: AI Chatbot Integration
- **Description**: Add AI chatbot for querying tasks and projects
- **Tasks**:
  - Set up AI API integration
  - Create chatbot UI
  - Implement conversation history
  - Add task/project querying capabilities
- **Files**:
  - `app/api/ai/route.ts`
  - `app/dashboard/ai-assistant/page.tsx`
  - `components/shared/AIChat.tsx`
  - `components/shared/ChatMessage.tsx`
  - `lib/actions/ai.ts` (server actions)

### Milestone 7: Testing & Refinement
- **Description**: Implement testing and refine the application
- **Tasks**:
  - Add unit and integration tests
  - Implement error handling
  - Add loading states
  - Optimize performance
  - Refine UI/UX
- **Files**:
  - `app/error.tsx`
  - `app/loading.tsx`
  - `__tests__/` (test files)

## 3. Reusable Components

### UI Components (shadcn/ui based)
- **General**:
  - Button (primary, secondary, danger, ghost)
  - Input
  - Textarea
  - Select
  - Checkbox
  - RadioGroup
  - Switch
  - DatePicker
  - Modal/Dialog
  - Tooltip
  - Toast notifications

- **Layout**:
  - Card
  - Panel
  - Tabs
  - Accordion
  - Sidebar
  - Navbar
  - Pagination

- **Data Display**:
  - Table (sortable, filterable)
  - DataGrid
  - Badge
  - Avatar
  - Stat card
  - Chart components (bar, line, pie)

- **Form Components**:
  - Form
  - FormField
  - FormLabel
  - FormMessage
  - Form validation

### Custom Components
- **Authentication**:
  - LoginForm
  - SignupForm
  - PasswordResetForm

- **Dashboard**:
  - DashboardLayout
  - DashboardSidebar
  - DashboardNavbar
  - StatCard

- **Employees**:
  - EmployeeList
  - EmployeeForm
  - EmployeeCard
  - SalaryTable
  - SalaryForm

- **Projects**:
  - ProjectList
  - ProjectForm
  - ProjectCard
  - ProjectFilter

- **Tasks**:
  - TaskForm
  - TaskCard
  - KanbanBoard
  - KanbanColumn
  - BacklogTable
  - TaskFilter
  - TaskAssignee

- **Shared**:
  - SearchInput
  - FilterDropdown
  - SortDropdown
  - EmptyState
  - LoadingState
  - ErrorState
  - ConfirmDialog
  - AIChat

## 4. Technology Usage

### Prisma
- Database schema definition in `prisma/schema.prisma`
- CRUD operations for all entities
- Relations between entities (Employee to Tasks, Projects to Tasks)
- Data seeding for initial setup

### Server Actions
- Authentication actions
- Employee CRUD actions
- Project CRUD actions
- Task CRUD actions
- AI chatbot actions
- Form handling and validation

### NextAuth.js
- User authentication
- Session management
- Role-based access control
- Protected routes via middleware

### shadcn/ui
- Base UI components
- Theme customization
- Form components
- Data display components

## 5. AI Prompt Logs

Initial `.md` files to create in the `ai/` directory:

1. `architecture.md` - Project structure and planning
2. `db-schema.md` - Database schema design
3. `auth-implementation.md` - Authentication implementation
4. `employee-management.md` - Employee management features
5. `project-management.md` - Project management features
6. `task-management.md` - Task management features
7. `ai-chatbot.md` - AI chatbot implementation

Each file should include:
- Original requirements
- Technical decisions made
- Implementation approach
- Code snippets
- Edge cases considered
- Prompts used to generate the solution

## 6. Edge Cases to Handle

- **Authentication**:
  - Expired sessions
  - Invalid credentials
  - Password requirements
  - Email verification
  - Password reset

- **Employees**:
  - No employees in the system
  - Employee with no salary data
  - Deleting an employee assigned to tasks
  - Duplicate employee records

- **Projects**:
  - Empty projects list
  - Project with no tasks
  - Deleting a project with tasks
  - Long project names/descriptions

- **Tasks**:
  - Empty task columns in Kanban
  - Unassigned tasks
  - Tasks with past due dates
  - Moving tasks between statuses
  - Filtering with no matching results
  - Tasks assigned to employees no longer with the company

- **AI Chatbot**:
  - Handling unclear queries
  - No matching results for queries
  - Rate limiting
  - Error handling for AI service
  - Conversation context management

## First Milestone Implementation

Let's start with Milestone 1: Project Setup & Authentication.