import { Metadata } from 'next';
import { auth } from '@/auth';
import { hasPermission } from '@/lib/constants/roles';
import { redirect } from 'next/navigation';
import { ProjectForm } from '@/components/projects/project-form';

export const metadata: Metadata = {
  title: 'Create Project | HR Management',
  description: 'Create a new project',
};

export default async function CreateProjectPage() {
  // Get the current session
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Check if user has permission to create projects
  const canCreateProject = hasPermission(session.user.role, 'projects', 'create');
  
  if (!canCreateProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to create projects.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Project</h1>
      </div>
      
      <ProjectForm />
    </div>
  );
}
