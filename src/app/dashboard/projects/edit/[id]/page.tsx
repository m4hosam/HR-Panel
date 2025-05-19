import { Metadata } from 'next';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/constants/roles';
import { notFound, redirect } from 'next/navigation';
import { ProjectForm } from '@/components/projects/project-form';
import { getProjectById } from '@/lib/actions/project-actions';

export const metadata: Metadata = {
  title: 'Edit Project | HR Management',
  description: 'Edit project details',
};

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  // Get the current session
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Check if user has permission to update projects
  const canUpdateProject = hasPermission(session.user.role, 'projects', 'update');
  
  if (!canUpdateProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to edit projects.
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>
      
      <ProjectForm project={project} />
    </div>
  );
}
