import AdminShellWrapper from '@/components/Admin/AdminShellWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellWrapper>{children}</AdminShellWrapper>;
}
