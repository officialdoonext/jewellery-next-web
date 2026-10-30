import React from 'react';
import { notFound } from 'next/navigation';
import { NAVIGATION_MODULES, findSubmenuItem } from '@/lib/navigation';
import { ClientLayout } from '@/components/ClientLayout';
import { ComingSoonView } from '@/components/ComingSoonView';

export async function generateStaticParams() {
  const params: { module: string; subpage: string }[] = [];
  NAVIGATION_MODULES.forEach((mod) => {
    mod.items.forEach((item) => {
      params.push({
        module: mod.slug,
        subpage: item.slug,
      });
    });
  });
  return params;
}

export default async function SubmenuDetailPage({
  params,
}: {
  params: Promise<{ module: string; subpage: string }>;
}) {
  const { module: moduleSlug, subpage: subpageSlug } = await params;

  const data = findSubmenuItem(moduleSlug, subpageSlug);

  if (!data) {
    notFound();
  }

  const { module, item } = data;

  return (
    <ClientLayout>
      <ComingSoonView module={module} item={item} />
    </ClientLayout>
  );
}
