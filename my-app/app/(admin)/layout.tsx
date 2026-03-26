import { AdminLayout } from '@/components/Admin/AdminLayout';
import React from 'react';

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  // Authorization check removed for easy access
  return <AdminLayout>{children}</AdminLayout>;
}
