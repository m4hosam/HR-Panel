import { Metadata } from 'next';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/constants/roles';
import { getProjects } from '@/lib/actions/project-actions';
import { ProjectList } from '@/components/projects/project-list';

export const metadata: Metadata = {
  title: 'Projects | HR Management',
  description: 'Manage your company projects',
};

interface ProjectsPageProps {
  searchParams: {
    search?: string;
    page?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  };
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  // Get the current session
  const session = await auth();
  
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }
  
  // Check if user has permission to view projects
  const canViewProjects = hasPermission(session.user.role, 'projects', 'read');
  const canCreateProject = hasPermission(session.user.role, 'projects', 'create');
  
  if (!canViewProjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view projects.
        </p>
      </div>
    );
  }
  
  // Get search and pagination parameters
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const status = searchParams.status || '';
  const sortBy = searchParams.sortBy || 'name';
  const sortDirection = searchParams.sortDirection || 'asc';
  
  // Get projects
  const { projects = [], pagination = { total: 0, pages: 1, page: 1, limit: 10 }, error } = await getProjects({
    page,
    search,
    status,
    sortBy,
    sortDirection: sortDirection as 'asc' | 'desc',
  });
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="container p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
      </div>
      
      <ProjectList
        initialProjects={projects}
        pagination={pagination}
        canCreate={canCreateProject}
      />
    </div>
  );
}
