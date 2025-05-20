import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | HR Management',
  description: 'Administrative tools for the HR Management system',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
