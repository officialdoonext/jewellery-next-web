import React from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { DashboardView } from '@/components/DashboardView';

export default function HomePage() {
  return (
    <ClientLayout>
      <DashboardView />
    </ClientLayout>
  );
}
