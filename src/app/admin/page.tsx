import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon, ShieldCheck, UserCog, Users, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Panel | HR Management',
  description: 'Administrative tools for the HR Management system',
};

export default function AdminPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Administrative tools and settings for the HR Management system
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCog className="mr-2 h-5 w-5" />
                User Role Management
              </CardTitle>
              <CardDescription>
                Update user roles to control access to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assign Administrator, Manager, or Employee roles to users in the system.
                Each role has different permissions and access levels.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/admin/user-roles">
                  Manage User Roles
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Currently under development. This section will allow configuration of 
                system-wide settings and preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
