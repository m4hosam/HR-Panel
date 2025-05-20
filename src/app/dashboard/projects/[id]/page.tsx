import { Metadata } from 'next';
import { getCurrentSession } from '@/auth';
import { hasPermission } from '@/lib/constants/roles';
import { getProjectById } from '@/lib/actions/project-actions';
import { ProjectDetail } from '@/components/projects/project-detail';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Project Details | HR Management',
  description: 'View project details and tasks',
};

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  // Get the current session
  const session = await getCurrentSession();
  
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
  const canUpdateProject = hasPermission(session.user.role, 'projects', 'update');
  const canDeleteProject = hasPermission(session.user.role, 'projects', 'delete');
  
  if (!canViewProjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view project details.
        </p>
      </div>
    );
  }
  
  // Get project details
  const { project, error } = await getProjectById(params.id);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }
  
  if (!project) {
    notFound();
  }
  
  return (
    <div className="container p-6">
      <ProjectDetail
        project={project}
        canUpdate={canUpdateProject}
        canDelete={canDeleteProject}
      />
    </div>
  );
}
